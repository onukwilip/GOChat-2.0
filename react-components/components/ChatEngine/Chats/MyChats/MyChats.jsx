import React, { useContext, useEffect, useState } from "react";
import css from "./MyChats.module.css";
import image from "../../../../assets/images/dummy-img.png";
import Glassmorphism from "../../../Glassmorphism/Glassmorphism";
import { General } from "../../../../context/GeneralContext";
import axios from "axios";
import EmojiPicker, { SKIN_TONE_MEDIUM_DARK } from "emoji-picker-react";
import { Reaction } from "../TheirChats/TheirChats";
import { emitMessage } from "../../ChatBlock/ChatBlock";
import { useRouter } from "next/router";
import { sendDiscussion } from "../../Messages/Messages";

const SeeMore = <p>See more</p>;
export const Icon = (props) => (
  <>
    <div className={css.icon} onClick={props.onClick}>
      <i className={`${props.icon} ${props.className}`}></i>
    </div>
  </>
);

const MyChats = ({ _chat, removeChat, userId }) => {
  const [showAllMessage, setShowAllMessage] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showAllParentMessage, setShowAllParentMessage] = useState(false);
  const [chat, setChat] = useState({ ..._chat });
  const [showPicker, setShowPicker] = useState(false);
  const general = useContext(General);
  const url = `${general.domain}api`;
  const navigate = useRouter();

  const replyChat = () => {
    const chatRoomID = JSON.parse(
      sessionStorage.getItem("chatRoom")
    )?.ChatRoomID;

    const values = {
      parentID: chat?.ChatID,
      parentName: chat?.Author?.AuthorName,
      parentMessage: chat?.Message,
      chatRoomID: chatRoomID,
    };

    general.setParentChatProperties(values);
  };

  const onReactionClick = (obj, e) => {
    postReaction(obj?.unified, obj?.emoji);
    setShowPicker(false);
  };

  const postReaction = async (reaction, emoji) => {
    const _url = `${url}/chats/reaction`;
    const body = {
      ChatID: chat?.ChatID,
      ChatRoomID: chat?.ChatroomID,
      ReactionID: reaction,
    };

    const response = await axios.post(_url, body, general.config).catch((e) => {
      console.log(e);
    });
    if (response) {
      addOrRemoveReaction(reaction);
      emitMessage(chat);
      sendDiscussion();

      if (response?.data?.ResponseCode === 200) {
        general.sendDiscussion({
          ChatID: chat?.ChatID,
          ChatRoomID: chat?.ChatroomID,
          LastMessage: `Reacted ${emoji} to a chat`,
          MemberID: userId,
        });
      } else if (response?.data?.ResponseCode === 204) {
        general.sendDiscussion({
          ChatID: chat?.ChatID,
          ChatRoomID: chat?.ChatroomID,
          LastMessage: `Unreacted to a chat`,
          MemberID: userId,
        });
      }
    }
  };

  const deleteChat = async () => {
    const confrimDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );

    if (confrimDelete) {
      const _url = `${url}/chats/${chat?.ChatID}`;
      const response = await axios.delete(_url, general.config).catch((e) => {
        setShowActions(false);
      });
      if (response) {
        setShowActions(false);
        emitMessage(chat);
        removeChat(chat?.ChatID);
      }
    } else {
      setShowActions(false);
    }
  };

  const editChat = () => {
    const componentToRender = {
      component: "EditChat",
      values: {
        ChatID: chat?.ChatID,
        ChatroomID: chat?.ChatroomID,
        Message: chat?.Message,
      },
    };

    sessionStorage.setItem(
      "componentToRender",
      JSON.stringify(componentToRender)
    );
    setShowActions(false);

    general.setModalState("true");
    sessionStorage.setItem("modalState", "true");
  };

  const addOrRemoveReaction = (reaction) => {
    const oldReactions = [...chat?.Reactions];
    const _reaction = {
      ChatID: chat?.ChatID,
      Date: chat?.Date,
      ChatroomID: chat?.ChatroomID,
      ReactionID: reaction,
      DateCreated: new Date(),
      Author: {
        AuthorID: userId,
        AuthorName: "sample string 2",
        AuthorImage: "sample string 3",
      },
    };

    const checkIfReactionParentExists = oldReactions.filter(
      (eachReaction) => eachReaction?.ReactionID === _reaction.ReactionID
    );

    //IF REACTION_HEAD WITH THIS REACTION_ID EXISTS ALREADY
    if (checkIfReactionParentExists?.length > 0) {
      // console.log("REACTION PARENT EXISTS ", checkIfReactionParentExists);
      const checkReactionWithUserIdExists =
        checkIfReactionParentExists[0]?.Reactions?.filter(
          (eachReaction) =>
            eachReaction?.Author?.AuthorID === _reaction.Author.AuthorID
        );
      //IF THIS MEMBER HAS ALREADY POSTED THIS SAME REACTION BEFORE
      if (checkReactionWithUserIdExists?.length > 0) {
        const updatedReactionChildren =
          checkIfReactionParentExists[0]?.Reactions?.filter(
            (eachReaction) =>
              eachReaction?.Author?.AuthorID !== _reaction.Author.AuthorID
          );
        // console.log("this user has posted this same reaction before");

        //IF THE REACTION STILL HAS SOME CHILDREN
        if (updatedReactionChildren?.length > 0) {
          const newReactionParent = { ...checkIfReactionParentExists[0] };
          // console.log("reaction still has children");

          //IF NEWREACTIONPARENT IS NOT EMPTY AND IS AN OBJECT
          if (
            typeof newReactionParent === "object" &&
            newReactionParent !== null &&
            newReactionParent !== undefined
          ) {
            // console.log("reaction parent isn't empty and is an object");
            newReactionParent.Reactions = updatedReactionChildren;
            const indexToUpdate = oldReactions?.findIndex(
              (eachReaction) =>
                eachReaction?.ReactionID === newReactionParent?.ReactionID
            );
            oldReactions[indexToUpdate] = newReactionParent;
            if (Array.isArray(oldReactions) && oldReactions?.length > 0) {
              setChat((prevChat) => ({
                ...prevChat,
                Reactions: [...oldReactions],
              }));
              // console.log("i reached here (Reaction still has children)");
            }
          }
        }
        //IF REACTION DOESN'T HAVE ANY OTHER CHILD
        else {
          // console.log("reaction doesn't have children");

          setChat((prevChat) => ({
            ...prevChat,
            Reactions: prevChat?.Reactions?.filter(
              (prevReactions) =>
                prevReactions?.ReactionID !== _reaction.ReactionID
            ),
          }));
          // console.log("i reached here (Reaction doesn't have children)");
        }
      }
      //IF THE USER WITH THIS USERID HAS NOT POSTED BEFORE
      else {
        // console.log(
        //   "Reaction parent exists, but this user hasn't posted before"
        // );

        const newReactionParent = { ...checkIfReactionParentExists[0] };
        newReactionParent?.Reactions?.push({ ..._reaction });

        const getParentIndex = oldReactions?.findIndex(
          (eachParentReaction) =>
            eachParentReaction?.ReactionID === _reaction?.ReactionID
        );

        oldReactions[getParentIndex] = {
          ...newReactionParent,
        };

        if (Array.isArray(oldReactions) && oldReactions?.length > 0) {
          setChat((prevChat) => ({
            ...prevChat,
            Reactions: [...oldReactions],
          }));
        }
      }

      // console.log(
      //   "REACTION MEMBER UNDER THIS REACTION",
      //   checkReactionWithUserIdExists
      // );
    }
    //IF REACTION_HEAD WITH THIS REACTION_ID DOES NOT EXIST
    else {
      // console.log(
      //   "REACTION PARENT DOESN'T EXISTS ",
      //   checkIfReactionParentExists
      // );

      const newReaction = {
        ChatID: chat?.ChatID,
        ChatroomID: chat?.ChatroomID,
        ReactionID: _reaction?.ReactionID,
        Reactions: [
          {
            ChatID: _reaction?.ChatID,
            ChatroomID: _reaction?.ChatroomID,
            ReactionID: _reaction?.ReactionID,
            DateCreated: new Date(),
            Author: {
              AuthorID: _reaction?.Author?.AuthorID,
              AuthorName: null,
              AuthorImage: null,
            },
          },
        ],
      };

      setChat((prev) => ({
        ...prev,
        Reactions: [...prev?.Reactions, { ...newReaction }],
      }));

      // console.log("Reaction parent doesn't exist so i added a new one");
    }

    // console.log("addOrRemoveReaction() was called");
  };

  useEffect(() => {
    setChat({ ..._chat });
  }, [_chat]);

  return (
    <div className={css["my-chats"]} id={chat?.ChatID}>
      <div className={css.main}>
        <div
          className={css["img-container"]}
          onClick={() => {
            navigate.push(
              `/?tab=user&userid=${general.toBase64(chat?.Author?.AuthorID)}`
            );
          }}
        >
          <img src={chat?.Author?.AuthorImage} alt="" />
        </div>
        <div className={css["text-body"]}>
          <p className={css.name}>{chat?.Author?.AuthorName}</p>
          <div style={{ maxWidth: "50%", minWidth: "200px" }} align="right">
            <div className={css["file-container"]}>
              {chat?.ChatFile.length >= 1
                ? chat?.ChatFile.map((eachFile, i) => (
                    <Glassmorphism className={css.file} key={i}>
                      <a>
                        <div className={css["file-icon-container"]}>
                          <i className="fas fa-file"></i>
                        </div>
                      </a>
                      <div className={css["file-details"]}>
                        <a
                          href={eachFile.Path}
                          download={eachFile.FileName}
                          target="_blank"
                        >
                          <em className={css["file-name"]}>
                            {eachFile.FileName}
                          </em>
                        </a>
                        <em className={css["file-size"]}>
                          {eachFile.Size} Kb file...
                        </em>
                      </div>
                    </Glassmorphism>
                  ))
                : null}
            </div>
            <div className={css["filter-container"]}>
              {showActions && (
                <div className={css.actions}>
                  <Icon icon="fa-solid fa-reply" onClick={replyChat} />
                  <Icon
                    icon="fa-solid fa-pen-to-square"
                    className={css.edit}
                    onClick={editChat}
                  />
                  <Icon
                    icon="fa-solid fa-trash"
                    className={css.delete}
                    onClick={deleteChat}
                  />
                </div>
              )}
              <div
                onClick={() => {
                  setShowActions((prev) => !prev);
                }}
              >
                <Icon icon="fa-solid fa-ellipsis" />
              </div>
              <Glassmorphism className={css.filter}>
                {chat.Parent.ParentID !== null &&
                chat.Parent.ParentID !== "" ? (
                  <>
                    {chat?.Parent.ParentMessage !== null &&
                    chat?.Parent.ParentMessage !== "" ? (
                      <>
                        <a
                          href={`#${chat.Parent.ParentID}`}
                          className={css["replied-link"]}
                        >
                          <div className={css["replied-message"]}>
                            <em className={css["parent-author"]}>
                              {chat?.Parent?.ParentAuthor}
                            </em>
                            <em className={css["parent-message"]}>
                              {chat?.Parent?.ParentMessage?.length > 50 ? (
                                <>
                                  {chat?.Parent?.ParentMessage.substring(0, 50)}
                                  ...
                                </>
                              ) : (
                                <>{chat?.Parent?.ParentMessage}</>
                              )}
                            </em>
                          </div>
                        </a>
                      </>
                    ) : null}
                  </>
                ) : null}

                <div className={css.message}>
                  {/* {chat?.message} */}
                  {chat?.Message?.length > 100 && !showAllMessage ? (
                    <>
                      {chat?.Message?.substring(0, 100)}
                      <a
                        onClick={() => {
                          setShowAllMessage((prev) => !prev);
                        }}
                        className={css.toogle}
                      >
                        ...See more
                      </a>
                    </>
                  ) : (
                    <>
                      {chat?.Message}
                      {chat?.Message.length > 100 && showAllMessage ? (
                        <>
                          <a
                            onClick={() => {
                              setShowAllMessage((prev) => !prev);
                            }}
                            className={css.toogle}
                          >
                            &nbsp; See less
                          </a>
                        </>
                      ) : null}
                    </>
                  )}
                </div>
              </Glassmorphism>
            </div>
          </div>

          <div className={css.time}>
            {new Date(chat?.Date).toLocaleString()}
          </div>

          <div className={css["reaction-container"]}>
            {showPicker && (
              <div className={css["picker-container"]}>
                <div className={css.picker}>
                  <EmojiPicker onEmojiClick={onReactionClick} />
                </div>
              </div>
            )}
            <div className={css.reactions}>
              {chat?.Reactions?.length > 0 && (
                <>
                  {chat?.Reactions?.map((eachReaction, i) => {
                    let sym = eachReaction?.ReactionID?.split("-");
                    let codesArray = [];
                    sym?.forEach((el) => codesArray.push(`0x${el}`));
                    let reaction = String?.fromCodePoint(...codesArray);
                    // console.log(eachReaction);
                    return (
                      <Reaction
                        reaction={reaction}
                        onClick={() => {
                          postReaction(eachReaction?.ReactionID, reaction);
                        }}
                        eachReaction={eachReaction}
                        key={i}
                      />
                    );
                  })}
                </>
              )}
              <Icon
                icon="fa fa-plus"
                onClick={() => {
                  setShowPicker((prev) => !prev);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyChats;
