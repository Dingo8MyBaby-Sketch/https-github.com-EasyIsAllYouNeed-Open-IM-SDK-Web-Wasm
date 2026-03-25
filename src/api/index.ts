import { DatabaseErrorCode } from '@/constant';
import { RPCMessageEvent, RPC, RPCError } from 'rpc-shooter';
import { initBackend } from 'absurd-sql-optimized/dist/indexeddb-main-thread';

let rpc: RPC | undefined;
let worker: Worker | undefined;
let debug = false;

export let workerPromise: Promise<void> = Promise.resolve();

function supportsModuleWorkers() {
  if (typeof Worker !== 'undefined' && 'type' in Worker.prototype) {
    return true;
  }
  try {
    const blob = new Blob([''], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    new Worker(url, { type: 'module' });
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function initWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  const isSupportModuleWorker = supportsModuleWorkers();

  let workerUrl = isSupportModuleWorker
    ? new URL('worker.js', import.meta.url)
    : new URL('worker-legacy.js', import.meta.url);

  worker = new Worker(workerUrl, {
    type: isSupportModuleWorker ? 'module' : 'classic',
  });

  initBackend(worker);

  rpc = new RPC({
    event: new RPCMessageEvent({
      currentEndpoint: worker,
      targetEndpoint: worker,
    }),
  });
}

function resetWorker() {
  if (rpc) {
    rpc.destroy();
    rpc = undefined;
  }
  if (worker) {
    worker.terminate();
    worker = undefined;
  }
}

initWorker();

function catchErrorHandle(error: unknown) {
  if ((error as RPCError).code === -32300) {
    resetWorker();

    return JSON.stringify({
      data: '',
      errCode: DatabaseErrorCode.ErrorDBTimeout,
      errMsg: 'database maybe damaged',
    });
  }

  throw error;
}

function _logWrap(...args: any[]) {
  if (debug) {
    console.info(...args);
  }
}

function registeMethodOnWindow(
  name: string,
  realName?: string,
  needStringify = true
) {
  _logWrap(`=> (database api) registe ${realName ?? name}`);

  return async (...args: unknown[]) => {
    if (!rpc || !worker) {
      initWorker();
    }

    if (!rpc) {
      return;
    }

    try {
      _logWrap(
        `=> (invoked by go wasm) run ${
          realName ?? name
        } method with args ${JSON.stringify(args)}`
      );
      const response = await rpc.invoke(name, ...args, { timeout: 5000000 });
      _logWrap(
        `=> (invoked by go wasm) run ${realName ?? name} method with response `,
        JSON.stringify(response)
      );

      if (!needStringify) {
        return response;
      }

      return JSON.stringify(response);
    } catch (error: unknown) {
      catchErrorHandle(error);
    }
  };
}

export function initDatabaseAPI(isLogStandardOutput = true): void {
  if (!rpc) {
    return;
  }
  debug = isLogStandardOutput;

  // upload
  window.wasmOpen = registeMethodOnWindow('wasmOpen');
  window.wasmClose = registeMethodOnWindow('wasmClose');
  window.wasmRead = registeMethodOnWindow('wasmRead', 'wasmRead', false);
  window.getUpload = registeMethodOnWindow('getUpload');
  window.insertUpload = registeMethodOnWindow('insertUpload');
  window.updateUpload = registeMethodOnWindow('updateUpload');
  window.deleteUpload = registeMethodOnWindow('deleteUpload');
  window.fileMapSet = registeMethodOnWindow('fileMapSet');
  window.fileMapClear = registeMethodOnWindow('fileMapClear');

  window.setSqlWasmPath = registeMethodOnWindow('setSqlWasmPath');
  window.initDB = registeMethodOnWindow('initDB');
  window.close = registeMethodOnWindow('close');

  // message
  window.getMessage = registeMethodOnWindow('getMessage');
  window.getMultipleMessage = registeMethodOnWindow('getMultipleMessage');
  window.getSendingMessageList = registeMethodOnWindow('getSendingMessageList');
  window.getNormalMsgSeq = registeMethodOnWindow('getNormalMsgSeq');
  window.updateMessageTimeAndStatus = registeMethodOnWindow(
    'updateMessageTimeAndStatus'
  );
  window.updateMessage = registeMethodOnWindow('updateMessage');
  window.updateMessageBySeq = registeMethodOnWindow('updateMessageBySeq');
  window.updateColumnsMessage = registeMethodOnWindow('updateColumnsMessage');
  window.insertMessage = registeMethodOnWindow('insertMessage');
  window.batchInsertMessageList = registeMethodOnWindow(
    'batchInsertMessageList'
  );
  window.getMessageList = registeMethodOnWindow('getMessageList');
  window.getMessageListNoTime = registeMethodOnWindow('getMessageListNoTime');
  window.messageIfExists = registeMethodOnWindow('messageIfExists');
  window.messageIfExistsBySeq = registeMethodOnWindow('messageIfExistsBySeq');
  window.getAbnormalMsgSeq = registeMethodOnWindow('getAbnormalMsgSeq');
  window.getAbnormalMsgSeqList = registeMethodOnWindow('getAbnormalMsgSeqList');
  window.batchInsertExceptionMsg = registeMethodOnWindow(
    'batchInsertExceptionMsg'
  );
  window.searchMessageByKeyword = registeMethodOnWindow(
    'searchMessageByKeyword'
  );
  window.searchMessageByContentType = registeMethodOnWindow(
    'searchMessageByContentType'
  );
  window.searchMessageByContentTypeAndKeyword = registeMethodOnWindow(
    'searchMessageByContentTypeAndKeyword'
  );
  window.updateMsgSenderNickname = registeMethodOnWindow(
    'updateMsgSenderNickname'
  );
  window.updateMsgSenderFaceURL = registeMethodOnWindow(
    'updateMsgSenderFaceURL'
  );
  window.updateMsgSenderFaceURLAndSenderNickname = registeMethodOnWindow(
    'updateMsgSenderFaceURLAndSenderNickname'
  );
  window.getMsgSeqByClientMsgID = registeMethodOnWindow(
    'getMsgSeqByClientMsgID'
  );
  window.getMsgSeqListByGroupID = registeMethodOnWindow(
    'getMsgSeqListByGroupID'
  );
  window.getMsgSeqListByPeerUserID = registeMethodOnWindow(
    'getMsgSeqListByPeerUserID'
  );
  window.getMsgSeqListBySelfUserID = registeMethodOnWindow(
    'getMsgSeqListBySelfUserID'
  );
  window.deleteAllMessage = registeMethodOnWindow('deleteAllMessage');
  window.getAllUnDeleteMessageSeqList = registeMethodOnWindow(
    'getAllUnDeleteMessageSeqList'
  );
  window.updateSingleMessageHasRead = registeMethodOnWindow(
    'updateSingleMessageHasRead'
  );
  window.updateGroupMessageHasRead = registeMethodOnWindow(
    'updateGroupMessageHasRead'
  );
  window.updateMessageStatusBySourceID = registeMethodOnWindow(
    'updateMessageStatusBySourceID'
  );
  window.getAlreadyExistSeqList = registeMethodOnWindow(
    'getAlreadyExistSeqList'
  );
  window.getMessageBySeq = registeMethodOnWindow('getMessageBySeq');
  window.getMessagesByClientMsgIDs = registeMethodOnWindow(
    'getMessagesByClientMsgIDs'
  );
  window.getMessagesBySeqs = registeMethodOnWindow('getMessagesBySeqs');
  window.getConversationNormalMsgSeq = registeMethodOnWindow(
    'getConversationNormalMsgSeq'
  );
  window.checkConversationNormalMsgSeq = registeMethodOnWindow(
    'getConversationNormalMsgSeq'
  );
  window.getConversationPeerNormalMsgSeq = registeMethodOnWindow(
    'getConversationPeerNormalMsgSeq'
  );
  window.deleteConversationAllMessages = registeMethodOnWindow(
    'deleteConversationAllMessages'
  );
  window.markDeleteConversationAllMessages = registeMethodOnWindow(
    'markDeleteConversationAllMessages'
  );
  window.getUnreadMessage = registeMethodOnWindow('getUnreadMessage');
  window.markConversationMessageAsReadBySeqs = registeMethodOnWindow(
    'markConversationMessageAsReadBySeqs'
  );
  window.markConversationMessageAsReadDB = registeMethodOnWindow(
    'markConversationMessageAsRead'
  );
  window.deleteConversationMsgs = registeMethodOnWindow(
    'deleteConversationMsgs'
  );
  window.markConversationAllMessageAsRead = registeMethodOnWindow(
    'markConversationAllMessageAsRead'
  );
  window.searchAllMessageByContentType = registeMethodOnWindow(
    'searchAllMessageByContentType'
  );
  window.insertSendingMessage = registeMethodOnWindow('insertSendingMessage');
  window.deleteSendingMessage = registeMethodOnWindow('deleteSendingMessage');
  window.getAllSendingMessages = registeMethodOnWindow('getAllSendingMessages');

  // conversation
  window.getAllConversationListDB = registeMethodOnWindow(
    'getAllConversationList'
  );
  window.getAllConversationListToSync = registeMethodOnWindow(
    'getAllConversationListToSync'
  );
  window.getHiddenConversationList = registeMethodOnWindow(
    'getHiddenConversationList'
  );
  window.getConversation = registeMethodOnWindow('getConversation');
  window.getMultipleConversationDB = registeMethodOnWindow(
    'getMultipleConversation'
  );
  window.updateColumnsConversation = registeMethodOnWindow(
    'updateColumnsConversation'
  );
  window.updateConversation = registeMethodOnWindow(
    'updateColumnsConversation',
    'updateConversation'
  );
  window.updateConversationForSync = registeMethodOnWindow(
    'updateColumnsConversation',
    'updateConversationForSync'
  );
  window.decrConversationUnreadCount = registeMethodOnWindow(
    'decrConversationUnreadCount'
  );
  window.batchInsertConversationList = registeMethodOnWindow(
    'batchInsertConversationList'
  );
  window.insertConversation = registeMethodOnWindow('insertConversation');
  window.getTotalUnreadMsgCountDB = registeMethodOnWindow(
    'getTotalUnreadMsgCount'
  );
  window.getConversationByUserID = registeMethodOnWindow(
    'getConversationByUserID'
  );
}
