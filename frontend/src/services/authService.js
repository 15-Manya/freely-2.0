import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth'
import { auth } from '../config/firebase'

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} fullName - User's full name
 * @returns {Promise<User>} - The created user
 */
export const signUp = async (email, password, fullName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    // Update user profile with display name
    if (fullName) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      })
    }

    // Send email verification
    await sendEmailVerification(userCredential.user)

    return userCredential.user
  } catch (error) {
    // Re-throw with a more user-friendly error message
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Sign in an existing user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<User>} - The signed-in user
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return userCredential.user
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Convert Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} - User-friendly error message
 */
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.'
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.'
    default:
      return 'An error occurred. Please try again.'
  }
}

