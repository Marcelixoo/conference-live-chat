/**
 * CSS Modules enforces scoped styling by default.
 * That means the styling defined in the module files
 * is only to be applied upon the current component.
 */
import { useContext } from 'react';
import styles from './App.module.scss';
import { LoginBox } from './components/LoginBox';
import { MessageList } from './components/MessageList';
import { SendMessageForm } from './components/SendMessageForm';
import { AuthContext } from './contexts/auth';

export function App() {
  const { user } = useContext(AuthContext);


  return (
    <main className={`${styles.contentWrapper} ${!!user ? styles.contentSigned : ''}`}>
      <MessageList />
      {!!user ? <SendMessageForm /> : <LoginBox />}
      {/* {!Boolean(user) ? <SendMessageForm /> : <LoginBox />} */}
    </main>
  )
}

export default App
