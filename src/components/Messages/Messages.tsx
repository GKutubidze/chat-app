import useAuth from "../../context/AuthContext";
import { Message } from "../../Types/Types";
import styles from "./Messages.module.css";
interface Props {
  messages: Message[];
}
const Messages = (props: Props) => {
  const { user } = useAuth();
  const { messages } = props;
  return (
    <div className={styles.messages}>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={
            msg.sender === user?._id ? styles.myMessage : styles.theirMessage
          }
        >
          <p> {msg.message}</p>

          <span className={styles.timestamp}>
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Messages;
