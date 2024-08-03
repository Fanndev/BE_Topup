import adminFirebase from "firebase-admin";
import serviceAccount from "../config/serviceAccount.json";
// Importing the service account key
import { _serviceAccount } from "../secret";

// Check if Firebase Admin SDK has not been initialized
  adminFirebase.initializeApp({
    credential: adminFirebase.credential.cert(serviceAccount as any),
  });

// Exporting the initialized admin instance for use in other files
export default adminFirebase;
