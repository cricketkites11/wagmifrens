import React, { Component, useState, useEffect } from 'react';
import './App.css';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { useMoralis } from "react-moralis";
import { useWeb3Transfer } from "react-moralis";
import ReferApp from '../src/ReferApp';



const App = () => {
  const [inputLabel, setInputLabel] = useState('Type and press enter');
  const [inputValue, setInputValue] = useState('');
  const [chatBubbles, setChatBubbles] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState('Connect Wallet');
  const [connectWalletButton, setConnectWalletButton] = useState(null);
  const [alertDisplay, setAlertDisplay] = useState(false);
  const [alertText, setAlertText] = useState('Sample alert text');
  const [loadTotalMessagesPending, setTotalMessagesLoadPending] = useState(true);
  const [loadChatHistoryPending, setChatHistoryLoadPending] = useState(true);
  const [credits, setCredits] = useState(10);
  const { isWeb3Enabled, authenticate, web3, enableWeb3, isAuthenticated, user, logout, Moralis } = useMoralis();
  const [envServer, setEnvServer] = useState("http://localhost:3001/");
  const [web3Checked, setWeb3Checked] = useState(false);

  var currentUser = null;
  
  const toggleAlert = (state, msg) => {
    setAlertDisplay(state);
    setAlertText(msg);
	}

	// listen for account changes


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

const TransferEth = () => {
    const isWeb3Active = Moralis.ensureWeb3IsInstalled();
    if (isWeb3Active) {
      console.log("Web 3 Activate");
    } else {
      console.log("Web 3 Inactivate");
    }

    const executeTransaction = async () => {
      const options = {
        type: "native",
        amount: Moralis.Units.ETH("0.05"),
        receiver: "0x7dd5B418a42E2f523b93422aa4E964B4C6639f32",
      };
      const transaction = await Moralis.transfer(options);
      const result = await transaction.wait();
      console.log("TRANSACTION: ", transaction.hash);

      const response = await fetch(envServer + `addcredits`,     {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          hash: transaction.hash,
        })
      });
      const data = await response.json();
      setCredits(data.data.credits);

    }

    return (
      // Use your custom error component to show errors
        <Button onClick={() => executeTransaction()}>
          Buy Credits
        </Button>
    );
};

const referApp = () => {
  return (
    // Use your custom error component to show errors
      <Button>
        Refer Frens
      </Button>
  );
}

  





  
//////////////////////////////////////////////////////////////////


/*

  if (!isWeb3Enabled) {
      enableWeb3();
  }
  */

  useEffect(async () => {
    if(loadTotalMessagesPending){
      setTotalMessagesLoadPending(false);

      console.log("launched");
      console.log("URL: ", envServer + `getMsgNum`);
      const response = await fetch(envServer + `getMsgNum`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'}
      });
      const data = await response.json();
      console.log(data.data.msgNum);
      setTotalMessages(data.data.msgNum);
    }
    if(loadChatHistoryPending){
      await loadChatHistory(user);
    }
    if(!web3Checked){
      await setWeb3Checked(true);
      console.log("Web 3 Check Begins: ", isWeb3Enabled, web3);
      if (!isWeb3Enabled) {
        console.log("Web 3 Enabling Begins: ", isWeb3Enabled, web3);
        enableWeb3();
        console.log("Web 3 Enabling Ends: ", isWeb3Enabled, web3);
      }
    }
  });
  const loadChatHistory = async (u) => {
    setChatHistoryLoadPending(false);
    console.log("chat history called: ", u);
    try{
      if(u){
        const userID = u.id;
        console.log("chat history called: ", userID);
        const response = await fetch(envServer + `getChatHistory`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userid: userID
          })
        });
        const data = await response.json();
      
        var u = await data.data.user;
        setCredits(u.credits);
        var chatMessages = u.messages;
        console.log("Credits: ", u.credits);
        if(chatMessages){
          chatMessages.forEach(chatMsg => {
            addChatBubble(chatMsg.from, chatMsg.message);
          });  
        }
        
      }
    } catch(e){
      console.log(e);
    }

  }
  const getAIResponse = async (userMessage) => {
    
      console.log("USER MESSAGE 1: ", userMessage);
    Moralis.User.currentAsync().then(async function(u) {
      var userID = 'abcdefg';
      var sessionToken = 'hijklmnop';
      if(u && user){
        console.log("current user: ", u.attributes);
        console.log("current username: ", u.attributes.username);
        console.log("current user token: ", u.attributes.sessionToken);
        console.log("object ID: ", user.id);
        console.log(user.get("ethAddress"));
        userID = user.id;
        sessionToken = u.attributes.sessionToken;
      }
      console.log("USER MESSAGE 2: ", userMessage);
      const response = await fetch(envServer + `webapp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          query: userMessage, 
          userid: userID,
          sessionToken: sessionToken
        })
      })
      const data = await response.json();
      addChatBubble(data.from, data.answers[0]);
      console.log(data.answers[0]);
      console.log(data.msgNum);
      setTotalMessages(data.msgNum);
      setCredits(data.credits);
    });
  }
  const connectWallet = () => {
    console.log("typeof:", typeof web3);
  }
  const moralisSignIn = () => {
    console.log('moralis called');
    if (!isAuthenticated) {
      return (
        <Button onClick={() => login()}>Authenticate</Button>
      );
    }

    
    
    return (
        <Box>
          <Typography>Welcome {user.get("username")}</Typography>
          <Button onClick={() => logOut()}>Sign Out</Button>
        </Box>
    );
  }
  const login = async () => {
      if (!isAuthenticated) {

        await authenticate({signingMessage: "Log in using Moralis" })
          .then(function (user) {
            Moralis.User.currentAsync().then(function(user) {
              console.log("current user: ", user.attributes);
              console.log("current username: ", user.attributes.username);
              console.log("current user token: ", user.attributes.sessionToken);
              console.log(user.get("ethAddress"));
              loadChatHistory(user);
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      }
  }
  const logOut = async () => {
    await logout();
    console.log("logged out");
    var session = Moralis.Session;
    console.log("User: ", user );
    setChatBubbles([]);
    setCredits(10);
  }
  const resetText = async (event) => {
    if(event.key==='Enter'){
      setInputValue('');
      const msg = event.target.value;
      await addChatBubble('You', msg);
      getAIResponse(msg);
      
    }
  }
  const addChatBubble = async (from, msg) => {
    var chatBubble = (
      <Container 
          sx=
          {{ p: 1, border: '1px solid grey', marginBottom: '20px' }}
        >
          <Typography variant="caption" display="block" gutterBottom>
            {from}
          </Typography>
          <Typography display="block" gutterBottom>
            {msg}
          </Typography>
        </Container>
    );
    setChatBubbles(chatBubbles => [chatBubble, ...chatBubbles]);
  }
  const handleEvent = (event) => {
    setInputValue(event.target.value);
    if(event.key==='Enter'){
      setInputValue('');
    }
    event = null;
  }


  return(
    <Container
    sx={{
      minWidth: "100%",
      maxWidth: "100%",
      backgroundColor: {
        xxs: "white",
        xs: "white",
        sm: "white",
        md: "#dddddd",
        lg: "#dddddd",
        xl: "#dddddd"
      }
    }}>
  <Container
    sx={{
      width:{
        xxs: "100%",
        xs: "100%",
        sm: "100%",
        md: "50%",
        lg: "50%",
        xl: "50%"
      },
      minHeight: "100vh",
      backgroundColor: "white"
    }}
  >
    <Box sx={{ 
      width: '100%',
      position: 'absolute',
      zIndex: 1000,
      width:{
        xxs: "90%",
        xs: "90%",
        sm: "90%",
        md: "45%",
        lg: "45%",
        xl: "45%"
      },
    }}>
    <Collapse in={alertDisplay}>
      <Alert
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              toggleAlert(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {alertText}
      </Alert>
    </Collapse>
  </Box>
    <ReferApp />

    
    {connectWalletButton}
    {moralisSignIn()}
    {referApp()}

    <Typography variant="h4" component="div" gutterBottom>
      WagmiFren
    </Typography>
    <Typography gutterBottom>
      Stressed out with this crypto market? Vent to your AI fren.
    </Typography>
    <Typography variant="caption" display="block" gutterBottom>
      *For entertainment purposes only.
    </Typography>

    <Box style={{
      border: '1px dashed grey',
      width: '150px',
      alignItems: 'center'
      }}
    >
      <Typography gutterBottom>
        {totalMessages}
      </Typography>
      <Typography variant="caption" display="block" gutterBottom>
       messages sent
      </Typography>
    </Box>

  <Box component="div" sx=
    {{ p: 2, border: '1px dashed grey', marginTop: '20px', marginBottom: '20px' }}
  >
      <Box style={{minHeight: '40vh', maxHeight: '40vh', overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column-reverse'
                  }}>
        {chatBubbles}
    </Box>
    <TextField fullWidth label={inputLabel} value={inputValue} id="fullWidth" 
      onChange={handleEvent}
      onKeyPress={resetText}
      />
<Typography variant="caption" display="block" gutterBottom sx={{marginTop: '5px'}}>
      Credits Left: {credits} | 0.01 ETH for 1000 credits | {TransferEth()}
    </Typography>
  </Box>

    
    <Typography gutterBottom>
      Twitter | Terms & Conditions | Privacy Policy | FAQ | About Us
    </Typography>
  </Container></Container>);
}



export default App;