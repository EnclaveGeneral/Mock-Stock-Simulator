import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  CssBaseline,
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { createUserProfile } from "../../services/dynamodbService";
import CardContainer from "../../ui/components/CardContainer";
import InputField from "../../ui/components/InputField";
import PrimaryButton from "../../ui/components/PrimaryButton";
import ErrorModal from "../Modals/errorModals";

function CreateProfile() {
  const [username, setUsername] = useState("");
  const [cashbalance, setCashbalance] = useState("");
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

  }
}

