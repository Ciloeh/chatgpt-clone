// src/pages/index.tsx
import ChatWindow from '../app/components/ChatWindow';

const Home = () => {
  return (
    <div className='relative flex h-full w-full overflow-hidden transition-colors z-0'>
      <ChatWindow />
    </div>
  );
};

export default Home;
