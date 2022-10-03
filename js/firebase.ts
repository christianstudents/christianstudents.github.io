import { initializeApp, getApps } from 'firebase/app';
export { getDatabase } from 'firebase/database';

/**
 * Initializes Firebase. If Firebase has already been initialized, this function does nothing.
 */
export const initFirebase = (): void => {
    // Only initialize if Firebase hasn't been initialized already.
    if (getApps().length === 0) {
        initializeApp({
            apiKey: "AIzaSyCxDl12rgil0SFWpRWYB-CibPiZfBJR_tc",
            authDomain: "scs-app-backend-481f8.firebaseapp.com",
            databaseURL: "https://scs-app-backend-481f8-default-rtdb.firebaseio.com",
            projectId: "scs-app-backend-481f8",
            storageBucket: "scs-app-backend-481f8.appspot.com",
            messagingSenderId: "476719591689",
            appId: "1:476719591689:web:00bd04d59492bbb8cfe3d8",
            measurementId: "G-52SQH82S7J"
        });
    }
};
