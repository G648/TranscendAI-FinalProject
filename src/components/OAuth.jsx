import {
  GoogleAuthProvider,
} from 'firebase/auth';

import Google from '../assets/Google.svg';
import { oAuthSignIn } from '../firebase';

export default function OAuth() {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');


  return (
    <div id="OAuth">
      <div id="providers" className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => oAuthSignIn(googleProvider)}
          className="rounded-full hover:bg-gray-500/10 flex flex-row gap-4 justify-center items-center p-4 w-[100%]"
        >
          <img src={Google} alt="google logo" />
          <p className=' text-black text-opacity-50 font-medium text-[24px] '> Continue With Google</p>
        </button>
      </div>
    </div>
  );
}
