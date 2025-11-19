import { signUp, signIn, confirmSignUp } from "aws-amplify/auth";


async function handleSignUp(userInputEmail, userInputPassword) {
  const signUpRes = await signUp({
    username: userInputEmail,
    password: userInputPassword,
    options: {
      userAttributes: {
        email: userInputEmail,
      },
    }
  });
  return signUpRes;
}

async function handleSignIn(userInputEmail, userInputPassword) {
  const signInRes = await signIn({
    username: userInputEmail,
    password: userInputPassword,
  });
  return signInRes;
}

async function handleConfirmSignUp(userInputEmail, userInputConfirmationCode) {
  const confirm = await confirmSignUp({
    username: userInputEmail,
    confirmationCode: userInputConfirmationCode,
  });
  return confirm;
}

export { handleSignUp, handleSignIn, handleConfirmSignUp }