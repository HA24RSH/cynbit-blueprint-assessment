import { FieldValue } from "firebase-admin/firestore";

import { db } from "../config/firebase.js";

export async function createProjectSubmission(submission) {
  const collection = db.collection("project_inquiries");

  // Let Firestore generate a unique document ID.
  const documentRef = collection.doc();

  // Generate a human-readable reference.
  const year = new Date().getFullYear();

  const referenceId =
    `CYN-${year}-${documentRef.id.slice(0, 8).toUpperCase()}`;

  const document = {
    ...submission,
    referenceId,
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
  };

  await documentRef.set(document);

  return {
    referenceId,
  };
}