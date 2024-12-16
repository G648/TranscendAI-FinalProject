// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  fetchSignInMethodsForEmail,
  getAuth,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxmhz-2HQMek9kIi3a7GJd0TnfDcpT_HM",
  authDomain: "sociallogin-dd739.firebaseapp.com",
  projectId: "sociallogin-dd739",
  storageBucket: "sociallogin-dd739.appspot.com",
  messagingSenderId: "197075812521",
  appId: "1:197075812521:web:632d3bd54033d1fd2a69b8",
  measurementId: "G-KBERK72EHB"
  /*
  apiKey: 'AIzaSyCz9X0WxeOGoRvdbIf22favHrAWqvcWFbQ',
  authDomain: 'dc-auth-app.firebaseapp.com',
  projectId: 'dc-auth-app',
  storageBucket: 'dc-auth-app.appspot.com',
  messagingSenderId: '717092564249',
  appId: '1:717092564249:web:f6ba4bed303391b2536988',
  */
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function emailSignUp({ email, password }) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.log(err);
  }
}

export async function emailSignIn({ email, password }) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.log(err);
  }
}

// Helper function to fetch emails from GitHub API
async function fetchGithubEmails(accessToken) {
  try {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned error: ${response.statusText}`);
    }

    const emails = await response.json();

    // Filter the primary email or public email
    return emails
      .filter((emailEntry) => emailEntry.primary)
      .map((emailEntry) => emailEntry.email);
  } catch (error) {
    console.error('Error fetching emails from GitHub:', error);
    return [];
  }
}

export async function oAuthSignIn(provider) {
  try {
    if (provider instanceof GithubAuthProvider) {
      // Add the email scope explicitly for GitHub provider
      provider.addScope('user:email');
    }

    // Attempt to sign in with the provider
    const result = await signInWithPopup(auth, provider);
    console.log(result)
    alert(result)

    // Check if result is defined
    if (!result) {
      console.error('Sign-in result is undefined or null.');
      return;
    }

    // Extract the user details from the result
    const { credential } = result;
    const { user } = result;
    const { additionalUserInfo } = result;

    // Log the results for better instrumentation
    console.log('OAuth login successful!');
    console.log('User ID:', user.uid);
    console.log('Display Name:', user.displayName);
    console.log('Profile Picture:', user.photoURL);

    if (credential) {
      console.log('OAuth Access Token:', credential.accessToken);
    } else {
      console.warn('No OAuth Access Token returned from provider.');
    }

    // Try to fetch the email (GitHub might return multiple emails)
    if (user.email) {
      console.log('User Email:', user.email);
    } else if (provider instanceof GithubAuthProvider && credential?.accessToken) {
      // Make an API call to GitHub to fetch the user's private/public email addresses
      const emails = await fetchGithubEmails(credential.accessToken);
      if (emails && emails.length > 0) {
        console.log('GitHub User Emails:', emails);
      } else {
        console.warn('No email addresses found from GitHub API.');
      }
    } else {
      // GitHub-specific: if email is not in the `user` object, check additional info
      // eslint-disable-next-line no-lonely-if
      if (additionalUserInfo.profile?.email) {
        console.log('GitHub User Email:', additionalUserInfo.profile.email);
      } else {
        console.warn('No email returned from provider.');
      }
    }
  } catch (error) {
    console.error(`Error occurred in oAuthSignIn method for provider ${provider.constructor.name}: ${error.message}\nStack Trace: ${error.stack}`);

    if (error.code === 'auth/account-exists-with-different-credential') {
      const { email } = error.customData;
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length === 0) {
        console.error('No associated sign-in methods found for this email.');
      } else {
        console.error(`Please sign in using one of the following methods: ${methods.join(', ')}`);
      }
    } else {
      console.error('Error during OAuth login:', error);
    }
  }
}

export async function firebaseSignOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.log(err);
  }
}
