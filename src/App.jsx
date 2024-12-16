import { Route, Routes } from 'react-router-dom';
import Feed from './routes/Feed';

import NotFound from './routes/NotFound';
import Profile from './routes/Profile';
// import SignUp from './routes/SignUp';
import TesteBlob from './routes/Blob';

export default function App() {
  return (
    <div id="App" className="flex flex-col items-center min-h-screen bg-white ">
      <h1 className="sr-only">Firebase Auth App</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route index="/feed" element={<Feed />} /> */}

        <Route path="/profile" element={<Profile />} />

        <Route path="/login" element={<LogIn />} />

        <Route path="*" element={<NotFound />} />

        <Route path="/uploadFile" element={<TesteBlob />} />
      </Routes>
    </div>
  );
}


import Home from './routes/Home';
import LogIn from './routes/LogIn';