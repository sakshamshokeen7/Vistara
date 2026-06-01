import React from "react";
import { Navigate } from "react-router-dom";

export default function UploadPage(){
  // Upload page deprecated — redirect to Photographer Dashboard where uploader is integrated
  return <Navigate to="/photographer" replace />;
}