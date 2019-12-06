import { Address, log } from '@graphprotocol/graph-ts'

import { DSChief } from '../../generated/templates/DssLaunchSpell/DSChief'
import { CastCall } from '../../generated/templates/DssLaunchSpell/DssLaunchSpell'

import { Spell, Action } from '../../generated/schema'

import {
  BIGINT_ONE,
  getGovernanceInfoEntity,
  updateGovernanceInfoEntity,
  fromBigIntToBigDecimal,
} from '../helpers'

import { DS_CHIEF } from '../constants'

export function handleCast(call: CastCall): void {
  let dsChief = DSChief.bind(Address.fromString(DS_CHIEF))
  let approval = dsChief.approvals(call.to)

  log.info('DssLaunchSpell {} has been casted.', [call.to.toHexString()])

  let spell = Spell.load(call.to.toHexString())
  spell.casted = call.block.timestamp
  spell.castedWith = fromBigIntToBigDecimal(approval)
  spell.save()

  let actionId = 'CAST-' + call.transaction.hash.toHex() + '-' + call.to.toHexString()

  let action = new Action(actionId)
  action.type = 'CAST'
  action.sender = call.from
  action.spell = call.to
  action.block = call.block.number
  action.transactionHash = call.transaction.hash
  action.timestamp = call.block.timestamp
  action.save()

  let governanceInfo = getGovernanceInfoEntity()
  governanceInfo.countCasted = governanceInfo.countCasted.plus(BIGINT_ONE)
  governanceInfo.save()

  updateGovernanceInfoEntity(call.block)
}