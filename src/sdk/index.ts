import { initDatabaseAPI, workerPromise } from '@/api';
import Emitter from '@/utils/emitter';
import { v4 as uuidv4 } from 'uuid';
import { getGO, initializeWasm, getGoExitPromise } from './initialize';

import {
  AccessFriendApplicationParams,
  AccessGroupApplicationParams,
  AccessMessageParams,
  AddBlackParams,
  AddFriendParams,
  AdvancedMsgParams,
  AdvancedQuoteMsgParams,
  AtMsgParams,
  ChangeGroupMemberMuteParams,
  ChangeGroupMuteParams,
  ChangeInputStatesParams,
  CreateGroupParams,
  CustomMsgParams,
  CustomSignalParams,
  FaceMessageParams,
  FileMsgParamsByURL,
  FindMessageParams,
  GetAdvancedHistoryMsgParams,
  GetGroupMemberByTimeParams,
  GetGroupMemberParams,
  GetGroupMessageReaderParams,
  GetInputstatesParams,
  GetOneConversationParams,
  ImageMsgParamsByURL,
  InitAndLoginConfig,
  InsertGroupMsgParams,
  InsertSingleMsgParams,
  JoinGroupParams,
  LocationMsgParams,
  MergerMsgParams,
  OffsetParams,
  AccessToGroupParams,
  PartialUserItem,
  PinFriendParams,
  QuoteMsgParams,
  RemarkFriendParams,
  RtcActionParams,
  SearchFriendParams,
  SearchGroupMemberParams,
  SearchGroupParams,
  SearchLocalParams,
  SendGroupReadReceiptParams,
  SendMsgParams,
  SetBurnDurationParams,
  SetConversationDraftParams,
  SetConversationExParams,
  SetConversationMsgDestructParams,
  SetConversationMsgDestructTimeParams,
  SetConversationParams,
  SetConversationPinParams,
  SetConversationPrivateStateParams,
  SetConversationRecvOptParams,
  SetFriendExParams,
  SetGroupMemberNickParams,
  SetGroupRoleParams,
  SetGroupVerificationParams,
  SetMemberPermissionParams,
  SetMessageLocalExParams,
  SignalingInviteParams,
  SoundMsgParamsByURL,
  SplitConversationParams,
  TransferGroupParams,
  TypingUpdateParams,
  UpdateFriendsParams,
  UpdateMemberInfoParams,
  UploadFileParams,
  VideoMsgParamsByURL,
  GetSpecifiedFriendsParams,
} from '../types/params';

import {
  AdvancedGetMessageResult,
  BlackUserItem,
  CallingRoomData,
  CardElem,
  ConversationItem,
  FriendApplicationItem,
  FriendshipInfo,
  FriendUserItem,
  GroupApplicationItem,
  GroupItem,
  GroupMemberItem,
  IMConfig,
  MessageItem,
  PublicUserItem,
  RtcInviteResults,
  SearchedFriendsInfo,
  SearchMessageResult,
  SelfUserInfo,
  UserOnlineState,
  WSEvent,
  WsResponse,
} from '../types/entity';
import { GroupAtType, LoginStatus, MessageReceiveOptType, Platform } from '@/types/enum';
import { logBoxStyleValue } from '@/utils';

class SDK extends Emitter {
  private wasmInitializedPromise: Promise<any>;
  private goExitPromise: Promise<void> | undefined;
  private goExisted = false;
  private tryParse = true;
  private isLogStandardOutput = true;

  constructor(url = '/openIM.wasm', debug = true) {
    super();

    initDatabaseAPI(debug);
    this.isLogStandardOutput = debug;
    this.wasmInitializedPromise = initializeWasm(url);
    this.goExitPromise = getGoExitPromise();

    if (this.goExitPromise) {
      this.goExitPromise
        .then(() => {
          this._logWrap('SDK => wasm exist');
        })
        .catch(err => {
          this._logWrap('SDK => wasm with error ', err);
        })
        .finally(() => {
          this.goExisted = true;
        });
    }
  }

  _logWrap(...args: any[]) {
    if (this.isLogStandardOutput) {
      console.info(...args);
    }
  }

  _invoker<T>(
    functionName: string,
    func: (...args: any[]) => Promise<any>,
    args: any[],
    processor?: (data: string) => string
  ): Promise<WsResponse<T>> {
    return new Promise(async (resolve, reject) => {
      this._logWrap(
        `%cSDK =>%c [OperationID:${args[0]}] (invoked by js) run ${functionName} with args ${JSON.stringify(args)}`,
        'font-size:14px; background:#7CAEFF; border-radius:4px; padding-inline:4px;',
        ''
      );

      let response = {
        operationID: args[0],
        event: (functionName.slice(0, 1).toUpperCase() +
          functionName.slice(1).toLowerCase()) as any,
      } as WsResponse<T>;
      try {
        if (!getGO() || getGO().exited || this.goExisted) {
          throw 'wasm exist already, fail to run';
        }

        let data = await func(...args);
        if (processor) {
          this._logWrap(
            `%cSDK =>%c [OperationID:${args[0]}] (invoked by js) run ${functionName} with response before processor ${JSON.stringify(data)}`,
            logBoxStyleValue('#FFDC19'),
            ''
          );
          data = processor(data);
        }

        if (this.tryParse) {
          try {
            data = JSON.parse(data);
          } catch (error) {
            // parse error
          }
        }
        response.data = data;
        resolve(response);
      } catch (error) {
        this._logWrap(
          `%cSDK =>%c [OperationID:${args[0]}] (invoked by js) run ${functionName} with error ${JSON.stringify(error)}`,
          logBoxStyleValue('#EE4245'),
          ''
        );
        response = {
          ...response,
          ...(error as WsResponse<T>),
        };
        reject(response);
      }
    });
  }

  login = async (params: InitAndLoginConfig, operationID = uuidv4()) => {
    this._logWrap(
      `SDK => (invoked by js) run login with args ${JSON.stringify({
        params,
        operationID,
      })}`
    );

    await workerPromise;
    await this.wasmInitializedPromise;
    window.commonEventFunc(event => {
      try {
        this._logWrap(
          `%cSDK =>%c received event %c${event}%c `,
          logBoxStyleValue('#282828', '#ffffff'),
          '',
          'color: #4f2398;',
          ''
        );
        const parsed = JSON.parse(event) as WSEvent;
        if (this.tryParse) {
          try {
            parsed.data = JSON.parse(parsed.data as string);
          } catch (error) {
            // parse error
          }
        }

        this.emit(parsed.event, parsed as any);
      } catch (error) {
        console.error(error);
      }
    });

    const config: IMConfig = {
      platformID: params.platformID,
      apiAddr: params.apiAddr,
      wsAddr: params.wsAddr,
      dataDir: './',
      logLevel: params.logLevel || 5,
      isLogStandardOutput:
        params.isLogStandardOutput ?? this.isLogStandardOutput,
      logFilePath: './',
      isExternalExtensions: params.isExternalExtensions || false,
    };
    this.tryParse = params.tryParse ?? true;
    window.initSDK(operationID, JSON.stringify(config));
    return await window.login(operationID, params.userID, params.token);
  };

  logout = <T>(operationID = uuidv4()) => {
    window.fileMapClear();
    return this._invoker<T>('logout', window.logout, [operationID]);
  };

  getAllConversationList = (operationID = uuidv4()) => {
    return this._invoker<ConversationItem[]>(
      'getAllConversationList',
      window.getAllConversationList,
      [operationID]
    );
  };

  getOneConversation = (
    params: GetOneConversationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<ConversationItem>(
      'getOneConversation',
      window.getOneConversation,
      [operationID, params.sessionType, params.sourceID]
    );
  };

  getAdvancedHistoryMessageList = (
    params: GetAdvancedHistoryMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<AdvancedGetMessageResult>(
      'getAdvancedHistoryMessageList',
      window.getAdvancedHistoryMessageList,
      [operationID, JSON.stringify(params)]
    );
  };

  getAdvancedHistoryMessageListReverse = (
    params: GetAdvancedHistoryMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<AdvancedGetMessageResult>(
      'getAdvancedHistoryMessageListReverse',
      window.getAdvancedHistoryMessageListReverse,
      [operationID, JSON.stringify(params)]
    );
  };

  getSpecifiedGroupsInfo = (params: string[], operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>(
      'getSpecifiedGroupsInfo',
      window.getSpecifiedGroupsInfo,
      [operationID, JSON.stringify(params)]
    );
  };

  deleteConversationAndDeleteAllMsg = <T>(
    conversationID: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'deleteConversationAndDeleteAllMsg',
      window.deleteConversationAndDeleteAllMsg,
      [operationID, conversationID]
    );
  };

  markConversationMessageAsRead = <T>(
    data: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'markConversationMessageAsRead',
      window.markConversationMessageAsRead,
      [operationID, data]
    );
  };

  sendGroupMessageReadReceipt = <T>(
    params: SendGroupReadReceiptParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'sendGroupMessageReadReceipt',
      window.sendGroupMessageReadReceipt,
      [
        operationID,
        params.conversationID,
        JSON.stringify(params.clientMsgIDList),
      ]
    );
  };

  getGroupMessageReaderList = (
    params: GetGroupMessageReaderParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMessageReaderList',
      window.getGroupMessageReaderList,
      [
        operationID,
        params.conversationID,
        params.clientMsgID,
        params.filter,
        params.offset,
        params.count,
      ]
    );
  };

  getGroupMemberList = (
    params: GetGroupMemberParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMemberList',
      window.getGroupMemberList,
      [operationID, params.groupID, params.filter, params.offset, params.count]
    );
  };

  createTextMessage = (text: string, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createTextMessage',
      window.createTextMessage,
      [operationID, text]
    );
  };

  createTextAtMessage = (params: AtMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createTextAtMessage',
      window.createTextAtMessage,
      [
        operationID,
        params.text,
        JSON.stringify(params.atUserIDList),
        JSON.stringify(params.atUsersInfo || []),
        params.message ? JSON.stringify(params.message) : '',
      ]
    );
  };

  createAdvancedTextMessage = (
    params: AdvancedMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createAdvancedTextMessage',
      window.createAdvancedTextMessage,
      [
        operationID,
        params.text,
        JSON.stringify(params.messageEntityList || []),
      ]
    );
  };

  createAdvancedQuoteMessage = (
    params: AdvancedQuoteMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createAdvancedQuoteMessage',
      window.createAdvancedQuoteMessage,
      [
        operationID,
        params.text,
        JSON.stringify(params.message),
        JSON.stringify(params.messageEntityList || []),
      ]
    );
  };

  createImageMessageByURL = (
    params: ImageMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createImageMessageByURL',
      window.createImageMessageByURL,
      [
        operationID,
        JSON.stringify(params.sourcePicture),
        JSON.stringify(params.bigPicture),
        JSON.stringify(params.snapshotPicture),
      ]
    );
  };

  createVideoMessageByURL = (
    params: VideoMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createVideoMessageByURL',
      window.createVideoMessageByURL,
      [operationID, JSON.stringify(params)]
    );
  };

  createSoundMessageByURL = (
    params: SoundMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createSoundMessageByURL',
      window.createSoundMessageByURL,
      [operationID, JSON.stringify(params)]
    );
  };

  createFileMessageByURL = (
    params: FileMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createFileMessageByURL',
      window.createFileMessageByURL,
      [operationID, JSON.stringify(params)]
    );
  };

  createMergerMessage = (params: MergerMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createMergerMessage',
      window.createMergerMessage,
      [
        operationID,
        JSON.stringify(params.messageList),
        params.title,
        JSON.stringify(params.summaryList),
      ]
    );
  };

  createFaceMessage = (params: FaceMessageParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createFaceMessage',
      window.createFaceMessage,
      [operationID, params.index, params.data]
    );
  };

  createLocationMessage = (
    params: LocationMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createLocationMessage',
      window.createLocationMessage,
      [operationID, params.description, params.longitude, params.latitude]
    );
  };

  createCustomMessage = (params: CustomMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createCustomMessage',
      window.createCustomMessage,
      [operationID, params.data, params.extension, params.description]
    );
  };

  createQuoteMessage = (params: QuoteMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createQuoteMessage',
      window.createQuoteMessage,
      [operationID, params.text, params.message]
    );
  };

  createCardMessage = (params: CardElem, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createCardMessage',
      window.createCardMessage,
      [operationID, JSON.stringify(params)]
    );
  };

  sendMessage = (params: SendMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'sendMessage',
      window.sendMessage,
      [
        operationID,
        JSON.stringify(params.message),
        params.recvID,
        params.groupID,
        JSON.stringify(params.offlinePushInfo || {}),
        params.isOnlineOnly || false,
      ]
    );
  };

  sendMessageNotOss = (params: SendMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'sendMessageNotOss',
      window.sendMessageNotOss,
      [
        operationID,
        JSON.stringify(params.message),
        params.recvID,
        params.groupID,
        JSON.stringify(params.offlinePushInfo || {}),
        params.isOnlineOnly || false,
      ]
    );
  };

  revokeMessage = (params: AccessMessageParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'revokeMessage',
      window.revokeMessage,
      [operationID, params.conversationID, params.clientMsgID]
    );
  };

  deleteMessage = (params: AccessMessageParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'deleteMessage',
      window.deleteMessage,
      [operationID, params.conversationID, params.clientMsgID]
    );
  };

  deleteAllMsgFromLocalAndSvr = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'deleteAllMsgFromLocalAndSvr',
      window.deleteAllMsgFromLocalAndSvr,
      [operationID]
    );
  };

  deleteAllMsgFromLocal = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'deleteAllMsgFromLocal',
      window.deleteAllMsgFromLocal,
      [operationID]
    );
  };

  clearConversationAndDeleteAllMsg = <T>(
    conversationID: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'clearConversationAndDeleteAllMsg',
      window.clearConversationAndDeleteAllMsg,
      [operationID, conversationID]
    );
  };

  insertSingleMessageToLocalStorage = (
    params: InsertSingleMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'insertSingleMessageToLocalStorage',
      window.insertSingleMessageToLocalStorage,
      [
        operationID,
        JSON.stringify(params.message),
        params.recvID,
        params.sendID,
      ]
    );
  };

  insertGroupMessageToLocalStorage = (
    params: InsertGroupMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'insertGroupMessageToLocalStorage',
      window.insertGroupMessageToLocalStorage,
      [
        operationID,
        JSON.stringify(params.message),
        params.groupID,
        params.sendID,
      ]
    );
  };

  typingStatusUpdate = (params: TypingUpdateParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'typingStatusUpdate',
      window.typingStatusUpdate,
      [operationID, params.recvID, params.msgTip]
    );
  };

  markMessagesAsReadByMsgID = (
    params: AccessMessageParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'markMessagesAsReadByMsgID',
      window.markMessagesAsReadByMsgID,
      [operationID, params.conversationID, params.clientMsgID]
    );
  };

  setMessageLocalEx = (
    params: SetMessageLocalExParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'setMessageLocalEx',
      window.setMessageLocalEx,
      [operationID, params.conversationID, params.clientMsgID, params.localEx]
    );
  };

  searchLocalMessages = (params: SearchLocalParams, operationID = uuidv4()) => {
    return this._invoker<SearchMessageResult>(
      'searchLocalMessages',
      window.searchLocalMessages,
      [operationID, JSON.stringify(params)]
    );
  };

  findMessageList = (params: FindMessageParams, operationID = uuidv4()) => {
    return this._invoker<SearchMessageResult>(
      'findMessageList',
      window.findMessageList,
      [operationID, JSON.stringify(params)]
    );
  };

  getSelfUserInfo = (operationID = uuidv4()) => {
    return this._invoker<SelfUserInfo>('getSelfUserInfo', window.getSelfUserInfo, [
      operationID,
    ]);
  };

  setSelfInfo = (params: PartialUserItem, operationID = uuidv4()) => {
    return this._invoker<null>(
      'setSelfInfo',
      window.setSelfInfo,
      [operationID, JSON.stringify(params)]
    );
  };

  getUsersInfoWithCache = (
    userIDList: string[],
    groupID: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<PublicUserItem[]>(
      'getUsersInfoWithCache',
      window.getUsersInfoWithCache,
      [operationID, JSON.stringify(userIDList), groupID]
    );
  };

  subscribeUsersStatus = (userIDList: string[], operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'subscribeUsersStatus',
      window.subscribeUsersStatus,
      [operationID, JSON.stringify(userIDList)]
    );
  };

  unsubscribeUsersStatus = (userIDList: string[], operationID = uuidv4()) => {
    return this._invoker<null>(
      'unsubscribeUsersStatus',
      window.unsubscribeUsersStatus,
      [operationID, JSON.stringify(userIDList)]
    );
  };

  getSubscribeUsersStatus = (operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'getSubscribeUsersStatus',
      window.getSubscribeUsersStatus,
      [operationID]
    );
  };

  getUserStatus = (userIDList: string[], operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'getUserStatus',
      window.getUserStatus,
      [operationID, JSON.stringify(userIDList)]
    );
  };

  setAppBackgroundStatus = (
    isBackground: boolean,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setAppBackgroundStatus',
      window.setAppBackgroundStatus,
      [operationID, isBackground]
    );
  };

  networkStatusChanged = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'networkStatusChanged',
      window.networkStatusChanged,
      [operationID]
    );
  };

  getLoginStatus = (operationID = uuidv4()) => {
    return this._invoker<LoginStatus>(
      'getLoginStatus',
      window.getLoginStatus,
      [operationID]
    );
  };

  getLoginUserID = (operationID = uuidv4()) => {
    return this._invoker<string>('getLoginUserID', window.getLoginUserID, [
      operationID,
    ]);
  };

  // Conversation methods
  setConversation = (params: SetConversationParams, operationID = uuidv4()) => {
    const { conversationID, ...rest } = params;
    return this._invoker<null>(
      'setConversation',
      window.setConversation,
      [operationID, conversationID, JSON.stringify(rest)]
    );
  };

  setConversationMsgDestructTime = (
    params: SetConversationMsgDestructTimeParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationMsgDestructTime',
      window.setConversationMsgDestructTime,
      [operationID, params.conversationID, params.msgDestructTime]
    );
  };

  setConversationIsMsgDestruct = (
    params: SetConversationMsgDestructParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationIsMsgDestruct',
      window.setConversationIsMsgDestruct,
      [operationID, params.conversationID, params.isMsgDestruct]
    );
  };

  pinConversation = (
    params: SetConversationPinParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'pinConversation',
      window.pinConversation,
      [operationID, params.conversationID, params.isPinned]
    );
  };

  setConversationRecvMessageOpt = (
    params: SetConversationRecvOptParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationRecvMessageOpt',
      window.setConversationRecvMessageOpt,
      [operationID, params.conversationID, params.opt]
    );
  };

  setConversationPrivateChat = (
    params: SetConversationPrivateStateParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationPrivateChat',
      window.setConversationPrivateChat,
      [operationID, params.conversationID, params.isPrivate]
    );
  };

  setConversationBurnDuration = (
    params: SetBurnDurationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationBurnDuration',
      window.setConversationBurnDuration,
      [operationID, params.conversationID, params.burnDuration]
    );
  };

  setConversationEx = (
    params: SetConversationExParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationEx',
      window.setConversationEx,
      [operationID, params.conversationID, params.ex]
    );
  };

  getTotalUnreadMsgCount = (operationID = uuidv4()) => {
    return this._invoker<number>(
      'getTotalUnreadMsgCount',
      window.getTotalUnreadMsgCount,
      [operationID]
    );
  };

  getConversationIDBySessionType = (
    params: GetOneConversationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<string>(
      'getConversationIDBySessionType',
      window.getConversationIDBySessionType,
      [operationID, params.sourceID, params.sessionType]
    );
  };

  setConversationDraft = (
    params: SetConversationDraftParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setConversationDraft',
      window.setConversationDraft,
      [operationID, params.conversationID, params.draftText]
    );
  };

  resetConversationGroupAtType = <T>(
    conversationID: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'resetConversationGroupAtType',
      window.resetConversationGroupAtType,
      [operationID, conversationID]
    );
  };

  getInputStates = (params: GetInputstatesParams, operationID = uuidv4()) => {
    return this._invoker<{ userID: string; platforms: Platform[] }[]>(
      'getInputStates',
      window.getInputStates,
      [operationID, params.conversationID, params.userID]
    );
  };

  changeInputStates = (
    params: ChangeInputStatesParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'changeInputStates',
      window.changeInputStates,
      [operationID, params.conversationID, params.focus]
    );
  };

  getAtAllTag = (operationID = uuidv4()) => {
    return this._invoker<string>('getAtAllTag', window.getAtAllTag, [
      operationID,
    ]);
  };

  getMultipleConversation = (
    conversationIDs: string[],
    operationID = uuidv4()
  ) => {
    return this._invoker<ConversationItem[]>(
      'getMultipleConversation',
      window.getMultipleConversation,
      [operationID, JSON.stringify(conversationIDs)]
    );
  };

  // Friend methods
  acceptFriendApplication = (
    params: AccessFriendApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'acceptFriendApplication',
      window.acceptFriendApplication,
      [operationID, params.toUserID, params.handleMsg]
    );
  };

  refuseFriendApplication = (
    params: AccessFriendApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'refuseFriendApplication',
      window.refuseFriendApplication,
      [operationID, params.toUserID, params.handleMsg]
    );
  };

  addFriend = (params: AddFriendParams, operationID = uuidv4()) => {
    return this._invoker<null>('addFriend', window.addFriend, [
      operationID,
      params.toUserID,
      params.reqMsg,
    ]);
  };

  getFriendApplicationListAsApplicant = (operationID = uuidv4()) => {
    return this._invoker<FriendApplicationItem[]>(
      'getFriendApplicationListAsApplicant',
      window.getFriendApplicationListAsApplicant,
      [operationID]
    );
  };

  getFriendApplicationListAsRecipient = (operationID = uuidv4()) => {
    return this._invoker<FriendApplicationItem[]>(
      'getFriendApplicationListAsRecipient',
      window.getFriendApplicationListAsRecipient,
      [operationID]
    );
  };

  getAllFriendList = (operationID = uuidv4()) => {
    return this._invoker<FriendUserItem[]>(
      'getAllFriendList',
      window.getAllFriendList,
      [operationID]
    );
  };

  searchFriends = (params: SearchFriendParams, operationID = uuidv4()) => {
    return this._invoker<SearchedFriendsInfo[]>(
      'searchFriends',
      window.searchFriends,
      [operationID, JSON.stringify(params)]
    );
  };

  getSpecifiedFriendsInfo = (
    params: GetSpecifiedFriendsParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<FriendUserItem[]>(
      'getSpecifiedFriendsInfo',
      window.getSpecifiedFriendsInfo,
      [operationID, JSON.stringify(params.friendUserIDList)]
    );
  };

  deleteFriend = (toUserID: string, operationID = uuidv4()) => {
    return this._invoker<null>('deleteFriend', window.deleteFriend, [
      operationID,
      toUserID,
    ]);
  };

  checkFriend = (userIDList: string[], operationID = uuidv4()) => {
    return this._invoker<FriendshipInfo[]>(
      'checkFriend',
      window.checkFriend,
      [operationID, JSON.stringify(userIDList)]
    );
  };

  setFriendRemark = (params: RemarkFriendParams, operationID = uuidv4()) => {
    return this._invoker<null>('setFriendRemark', window.setFriendRemark, [
      operationID,
      params.toUserID,
      params.remark,
    ]);
  };

  pinFriends = (params: PinFriendParams, operationID = uuidv4()) => {
    return this._invoker<null>('pinFriends', window.pinFriends, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  setFriendsEx = (params: SetFriendExParams, operationID = uuidv4()) => {
    return this._invoker<null>('setFriendsEx', window.setFriendsEx, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  updateFriends = (params: UpdateFriendsParams, operationID = uuidv4()) => {
    return this._invoker<null>('updateFriends', window.updateFriends, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  // Group methods
  createGroup = (params: CreateGroupParams, operationID = uuidv4()) => {
    return this._invoker<GroupItem>('createGroup', window.createGroup, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  joinGroup = (params: JoinGroupParams, operationID = uuidv4()) => {
    return this._invoker<null>('joinGroup', window.joinGroup, [
      operationID,
      params.groupID,
      params.reqMsg,
      params.joinSource,
      params.ex || '',
    ]);
  };

  quitGroup = (groupID: string, operationID = uuidv4()) => {
    return this._invoker<null>('quitGroup', window.quitGroup, [
      operationID,
      groupID,
    ]);
  };

  getJoinedGroupList = (operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>(
      'getJoinedGroupList',
      window.getJoinedGroupList,
      [operationID]
    );
  };

  searchGroups = (params: SearchGroupParams, operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>('searchGroups', window.searchGroups, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  setGroupInfo = (params: Partial<GroupItem> & { groupID: string }, operationID = uuidv4()) => {
    const { groupID, ...rest } = params;
    return this._invoker<null>('setGroupInfo', window.setGroupInfo, [
      operationID,
      groupID,
      JSON.stringify(rest),
    ]);
  };

  getGroupApplicationListAsApplicant = (operationID = uuidv4()) => {
    return this._invoker<GroupApplicationItem[]>(
      'getGroupApplicationListAsApplicant',
      window.getGroupApplicationListAsApplicant,
      [operationID]
    );
  };

  getGroupApplicationListAsRecipient = (operationID = uuidv4()) => {
    return this._invoker<GroupApplicationItem[]>(
      'getGroupApplicationListAsRecipient',
      window.getGroupApplicationListAsRecipient,
      [operationID]
    );
  };

  acceptGroupApplication = (
    params: AccessGroupApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'acceptGroupApplication',
      window.acceptGroupApplication,
      [operationID, params.groupID, params.fromUserID, params.handleMsg]
    );
  };

  refuseGroupApplication = (
    params: AccessGroupApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'refuseGroupApplication',
      window.refuseGroupApplication,
      [operationID, params.groupID, params.fromUserID, params.handleMsg]
    );
  };

  transferGroupOwner = (
    params: TransferGroupParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'transferGroupOwner',
      window.transferGroupOwner,
      [operationID, params.groupID, params.newOwnerUserID]
    );
  };

  dismissGroup = (groupID: string, operationID = uuidv4()) => {
    return this._invoker<null>('dismissGroup', window.dismissGroup, [
      operationID,
      groupID,
    ]);
  };

  changeGroupMute = (
    params: ChangeGroupMuteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>('changeGroupMute', window.changeGroupMute, [
      operationID,
      params.groupID,
      params.isMute,
    ]);
  };

  changeGroupMemberMute = (
    params: ChangeGroupMemberMuteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'changeGroupMemberMute',
      window.changeGroupMemberMute,
      [operationID, params.groupID, params.userID, params.mutedSeconds]
    );
  };

  setGroupVerification = (
    params: SetGroupVerificationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setGroupVerification',
      window.setGroupVerification,
      [operationID, params.groupID, params.verification]
    );
  };

  setGroupLookMemberInfo = (
    params: SetMemberPermissionParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setGroupLookMemberInfo',
      window.setGroupLookMemberInfo,
      [operationID, params.groupID, params.rule]
    );
  };

  setGroupApplyMemberFriend = (
    params: SetMemberPermissionParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setGroupApplyMemberFriend',
      window.setGroupApplyMemberFriend,
      [operationID, params.groupID, params.rule]
    );
  };

  getGroupMemberOwnerAndAdmin = (groupID: string, operationID = uuidv4()) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMemberOwnerAndAdmin',
      window.getGroupMemberOwnerAndAdmin,
      [operationID, groupID]
    );
  };

  getGroupMemberListByJoinTimeFilter = (
    params: GetGroupMemberByTimeParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMemberListByJoinTimeFilter',
      window.getGroupMemberListByJoinTimeFilter,
      [
        operationID,
        params.groupID,
        params.offset,
        params.count,
        params.joinTimeBegin,
        params.joinTimeEnd,
        JSON.stringify(params.filterUserIDList),
      ]
    );
  };

  getSpecifiedGroupMembersInfo = (
    groupID: string,
    userIDList: string[],
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getSpecifiedGroupMembersInfo',
      window.getSpecifiedGroupMembersInfo,
      [operationID, groupID, JSON.stringify(userIDList)]
    );
  };

  kickGroupMember = (
    params: AccessToGroupParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>('kickGroupMember', window.kickGroupMember, [
      operationID,
      params.groupID,
      params.reason,
      JSON.stringify(params.userIDList),
    ]);
  };

  inviteUserToGroup = (
    params: AccessToGroupParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'inviteUserToGroup',
      window.inviteUserToGroup,
      [
        operationID,
        params.groupID,
        params.reason,
        JSON.stringify(params.userIDList),
      ]
    );
  };

  searchGroupMembers = (
    params: SearchGroupMemberParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'searchGroupMembers',
      window.searchGroupMembers,
      [operationID, JSON.stringify(params)]
    );
  };

  setGroupMemberRoleLevel = (
    params: SetGroupRoleParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setGroupMemberRoleLevel',
      window.setGroupMemberRoleLevel,
      [operationID, params.groupID, params.userID, params.roleLevel]
    );
  };

  setGroupMemberNickname = (
    params: SetGroupMemberNickParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'setGroupMemberNickname',
      window.setGroupMemberNickname,
      [
        operationID,
        params.groupID,
        params.userID,
        params.groupMemberNickname,
      ]
    );
  };

  setGroupMemberInfo = (
    params: UpdateMemberInfoParams,
    operationID = uuidv4()
  ) => {
    const { groupID, userID, ...rest } = params;
    return this._invoker<null>(
      'setGroupMemberInfo',
      window.setGroupMemberInfo,
      [operationID, groupID, userID, JSON.stringify(rest)]
    );
  };

  getJoinedGroupListPage = (
    params: OffsetParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupItem[]>(
      'getJoinedGroupListPage',
      window.getJoinedGroupListPage,
      [operationID, params.offset, params.count]
    );
  };

  // Black list methods
  addBlack = (params: AddBlackParams, operationID = uuidv4()) => {
    return this._invoker<null>('addBlack', window.addBlack, [
      operationID,
      params.toUserID,
      params.ex || '',
    ]);
  };

  removeBlack = (toUserID: string, operationID = uuidv4()) => {
    return this._invoker<null>('removeBlack', window.removeBlack, [
      operationID,
      toUserID,
    ]);
  };

  getBlackList = (operationID = uuidv4()) => {
    return this._invoker<BlackUserItem[]>('getBlackList', window.getBlackList, [
      operationID,
    ]);
  };

  // Signaling methods
  signalingInvite = (
    params: SignalingInviteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<RtcInviteResults>(
      'signalingInvite',
      window.signalingInvite,
      [operationID, JSON.stringify(params)]
    );
  };

  signalingInviteInGroup = (
    params: SignalingInviteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<RtcInviteResults>(
      'signalingInviteInGroup',
      window.signalingInviteInGroup,
      [operationID, JSON.stringify(params)]
    );
  };

  signalingAccept = (params: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<CallingRoomData>(
      'signalingAccept',
      window.signalingAccept,
      [operationID, JSON.stringify(params)]
    );
  };

  signalingReject = (params: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<null>('signalingReject', window.signalingReject, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  signalingCancel = (params: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<null>('signalingCancel', window.signalingCancel, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  signalingHungUp = (params: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<null>('signalingHungUp', window.signalingHungUp, [
      operationID,
      JSON.stringify(params),
    ]);
  };

  signalingGetRoomByGroupID = (groupID: string, operationID = uuidv4()) => {
    return this._invoker<CallingRoomData>(
      'signalingGetRoomByGroupID',
      window.signalingGetRoomByGroupID,
      [operationID, groupID]
    );
  };

  signalingGetTokenByRoomID = (roomID: string, operationID = uuidv4()) => {
    return this._invoker<RtcInviteResults>(
      'signalingGetTokenByRoomID',
      window.signalingGetTokenByRoomID,
      [operationID, roomID]
    );
  };

  customSignalingSend = (
    params: CustomSignalParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'customSignalingSend',
      window.customSignalingSend,
      [operationID, JSON.stringify(params)]
    );
  };

  // Upload
  uploadFile = (params: UploadFileParams, operationID = uuidv4()) => {
    return this._invoker<{ url: string }>(
      'uploadFile',
      window.uploadFile,
      [operationID, JSON.stringify(params)]
    );
  };

  updateMsgSenderInfo = (
    nickname: string,
    faceURL: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<null>(
      'updateMsgSenderInfo',
      window.updateMsgSenderInfo,
      [operationID, nickname, faceURL]
    );
  };

  uploadLogs = (line = 1000, ex = '', operationID = uuidv4()) => {
    return this._invoker<null>('uploadLogs', window.uploadLogs, [
      operationID,
      line,
      ex,
    ]);
  };
}

let instance: SDK | undefined;

export function getSDK(url = '/openIM.wasm', debug = true): SDK {
  if (!instance) {
    instance = new SDK(url, debug);
  }
  return instance;
}
