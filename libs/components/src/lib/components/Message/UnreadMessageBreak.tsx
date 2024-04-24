import styles from './Message.module.scss';

export default function UnreadMessageBreak() {
	return (
		<div className={styles.UnreadMessage}>
			<div className={styles.LinePart}></div>
			<span className={styles.LineText}>New</span>
		</div>
	);
}
