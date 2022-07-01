import React, { Component, useState, useEffect } from 'react';
import './App.css';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { useMoralis } from "react-moralis";
import { useWeb3Transfer } from "react-moralis";
import LogoutIcon from '@mui/icons-material/Logout';
import FaceIcon from '@mui/icons-material/Face';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ReplyIcon from '@mui/icons-material/Reply';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {useRef} from 'react';

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
  const [envServer, setEnvServer] = useState("https://conservative-leaf-62188.herokuapp.com/");
  const [web3Checked, setWeb3Checked] = useState(false);
  const [displayReferrals, setDisplayReferrals] = useState("none");
  const [displayChat, setDisplayChat] = useState("none");
  const [referralLink, setReferralLink] = useState("");
  const [referralLinkSet, setReferralLinkSet] = useState(false);
  const [referralLeaderboard, setReferralLeaderboard] = useState([]);
  const [myReferralPoints, setMyReferralPoints] = useState([]);
  const [displayBanner, setDisplayBanner] = useState("block");
  const [displayTextInput, setDisplayTextInput] = useState(true);
  const textInput = useRef(null);

  const queryParams = new URLSearchParams(window.location.search);
  const referrerId = queryParams.get('refer');
  console.log("referrerId: ", referrerId);

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
      if (!isWeb3Enabled) {
        console.log("Web 3 Enabling Begins: ", isWeb3Enabled, web3);
        await enableWeb3();
        console.log("Web 3 Enabling Ends: ", isWeb3Enabled, web3);
      }
      if(!isWeb3Enabled){
        toggleAlert(true, "Something is wrong with your Metamask extension. Make sure you are signed into Metamask to make buy credits.");
      }
      const options = {
        type: "native",
        amount: Moralis.Units.ETH("0.05"),
        receiver: "0x11E6fa5A9f1f45C7b0C92E5912E7dD326cBaC6E0",
      };
      try{
        const transaction = await Moralis.transfer(options);
        toggleAlert(true, "Your transaction to purchase credits is in progress.");
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
        toggleAlert(true, "Your transaction to purchase credits has processed successfully! We added 1000 credtis to your account.");
      } catch (e){
        toggleAlert(true, "Something went wrong. Please confirm that your wallet is connected and you have sufficient balance");
      }
    }

    return (
      // Use your custom error component to show errors
        <Typography component="span" sx={{fontSize: '12px', textDecoration: 'underline', color: '#7000FF', 
          '&:hover': {cursor: 'pointer'}
        }} onClick={() => executeTransaction()}>
          Buy Credits
        </Typography>
    );
};


const refreshReferralLeaderboard = async () => {
  setReferralLeaderboard([]);
  var userId = null;
  if(user){
    userId = user.id;
  }
  const response = await fetch(envServer + `getreferralleaderboard`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userid: userId
    })
  });
  const data = await response.json();
  const users = data.data.users;
  console.log("LEADERBOARD USERS: ", users);
  setMyReferralPoints(data.data.myReferralPoints);

  if(users){
    users.forEach(user => {
      if (user.userId){
        var referralItem = (
          <TableRow key={user.userId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell  sx={{ color: "white", fontSize: "16px"}} component="th" scope="row">{user.userId.substring(0, 8)}...</TableCell>
            <TableCell  sx={{ color: "white", fontSize: "16px"}} align="right">{user.points}</TableCell>
          </TableRow>
        );
        setReferralLeaderboard(referralLeaderboard => [...referralLeaderboard, referralItem]);
      }
      
    })
  }
}

const referApp = () => {
  return (
    // Use your custom error component to show errors
      <Button sx=
        {{
          width: '130px', 
          backgroundColor: '#9E70FF', 
          color: 'white', 
          fontSize: '12px',
          position: 'absolute',
          left: '0',
          right: '0',
          bottom: '23vh',
          marginLeft: 'auto',
          marginRight: '5%',
          zIndex: '5'
        }}
        onClick={() => toggleReferralsBox()}>
        Refer Frens
      </Button>
  );
}
const updateReferralLink = () => {
  if(user){
    const userId = user.id;
    var referralLink = envServer + "?refer=" + userId;
    setReferralLink(referralLink);
  }
}

const toggleReferralsBox = () => {
  if(displayReferrals === "none"){
    setDisplayReferrals("flex");
    setDisplayChat("none");
    setDisplayBanner("none");
    setDisplayTextInput(false);
  } else {
    setDisplayReferrals("none");
    setDisplayChat("flex");
    setDisplayBanner("none");
    setDisplayTextInput(true);
  }
  updateReferralLink();
  refreshReferralLeaderboard();
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
    if(!referralLinkSet){
      await setReferralLinkSet(true);
      updateReferralLink();
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
            userid: userID,
            referrer: referrerId
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
        <Button onClick={() => login()} sx={{marginLeft: 'auto', marginRight: '0px', 
          backgroundColor: '#9E70FF', color: 'white', width: '130px', fontSize: '12px',
          '&:hover': {
            backgroundColor: '#854ffe',
            color: 'white',
          } 
        }}>Connect Wallet</Button>
      );
    }

    
    
    return (

          <Button onClick={() => logOut()} sx={{marginLeft: 'auto', marginRight: '0px', 
          backgroundColor: '#9E70FF', color: 'white', width: '130px', fontSize: '12px'}}>
            {user.get("ethAddress").substring(0, 8)}...

            <LogoutIcon fontSize="inherit" sx = {{marginLeft: 'auto', height: '1.5em', width: '1.5em'}}/>
          </Button>
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
              updateReferralLink();
              setDisplayBanner("none");
              setDisplayChat("flex");
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
    setDisplayReferrals("none");
    setDisplayChat("none");
    setDisplayBanner("block");

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
    var width = '80%';
    var marginLeft = '0px';
    var marginRight = '';
    if(from === "AI-Test"){
      marginLeft = '10%';
    }
    if (from === "System"){
      toggleAlert(true, msg);
      return;
    }
    var chatBubble = (
      <Container 
          sx=
          {{ padding: '10px 20px 10px 20px', border: '1px solid grey', marginBottom: '20px', background: "white",
            border: 'none',
            borderRadius: '10px',
            boxShadow: '2px 4px 4px 1px #aaaaaa59', width: {width}, marginLeft: {marginLeft}, marginRight: 'auto'}}
        >
          <Typography sx={{color: '#999999'}} variant="caption" display="block">
            {from}
          </Typography>
          <Typography sx={{color: '#333333'}} display="block">
            {msg}
          </Typography>
        </Container>
    );
    setChatBubbles(chatBubbles => [chatBubble, ...chatBubbles]);
  }
  const mintNFT = async (from, msg) => {
    toggleAlert(true, "Our NFT mint date is coming soon.");
  }
  const handleEvent = (event) => {
    setInputValue(event.target.value);
    if(event.key==='Enter'){
      setInputValue('');
    }
    event = null;
  }
  const handleCtaClick = () => {
    textInput.current.focus();
    setDisplayChat("flex");
    setDisplayBanner("none");
  }


  return(

<Container disableGutters
sx={{
  minWidth: "100%",
  maxWidth: "100%",
  minHeight: '100vh',
  backgroundColor: {
    xxs: "#f9f6ff",
    xs: "#f9f6ff",
    sm: "#f9f6ff",
    md: "#f9f6ff",
    lg: "#f9f6ff",
    xl: "#f9f6ff"
  },
  paddingLeft: '0px',
  paddingRight: '0px'
}}>
  <Container disableGutters
    sx={{
      minWidth:'100%',
      minHeight: '100vh',
      background: 'linear-gradient(to right bottom, #491FA1, #794ADC)',
      paddingLeft: '0px',
      paddingRight: '0px'
    }}
  >
    <Box component = "div" display = "flex">
      <Box component = "div" sx={{ marginLeft: 'auto', 
        marginRight: 'auto', position: 'absolute', left: '0px', 
        right: '0px', zIndex: '1000', width:{xxs: "90%", xs: "90%", sm: "90%", md: "45%", lg: "45%", xl: "45%"},}}>
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
    </Box>
    <Box sx={{paddingLeft: '5%', 
      paddingRight: '5%', 
      height: '10vh', 
      display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {(displayChat == "flex" || displayReferrals == "flex") &&
          <ArrowBackIosIcon sx={{color: 'white', zIndex: '2',  '&:hover': {
            cursor: 'pointer'
          }}}
          onClick={() => {
            console.log("clicked");
            setDisplayBanner("block");
            setDisplayChat("none");
            setDisplayReferrals("none");
            setDisplayTextInput(true);
          }}
          />
        }
        {(displayChat == "flex" || displayReferrals == "flex") &&
            <Typography sx={{
                textAlign: "center",
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '0px',
                marginLeft: 'auto',
                marginRight:'auto',
                position: 'absolute',
                left: '0',
                right: '0',
                zIndex: '0'
              }} variant="h4" component="div">
              3FRENS
            </Typography>
        }
      {connectWalletButton}
      {moralisSignIn()}
    </Box>
    <Box sx = {{paddingLeft: {xxs: "10%", xs: "10%", sm: "10%", md: "25%", lg: "25%", xl: "25%"}, 
      paddingRight: {xxs: "10%", xs: "10%", sm: "10%", md: "25%", lg: "25%", xl: "25%"}, 
      marginTop: '5vh', height: '65vh'}} display = {displayBanner}>
      <Typography sx={{
          textAlign: "center",
          color: '#fff',
          fontSize: '40px',
          fontWeight: '900',
          letterSpacing: '10px',
          marginBottom: '0px',
          fontFamily: "bebas neue"
        }} variant="h4" component="div">
        3FRENS
      </Typography>
      <Typography sx={{textAlign: "center",
          marginBottom: '20px', fontSize: '12px', color: '#fff'}} display="block" variant="caption">
        Beta
      </Typography>
      <Typography sx={{textAlign: "center", marginBottom: '22px', fontSize: '18px', color: 'white'}}>
        Stressed with this crypto market? Vent to your AI frens.
      </Typography>
      <Typography sx={{textAlign: "center", marginTop: '15px', color: 'white', fontSize: '16px'}} display="block">
        3 Frens are your AI friends that spread positivity and silly humor. The Frens know crypto and learn about you over time. Not financial advice - for entertainment purposes only.
      </Typography>
      <Box sx = {{display: "flex", alignItems: "center", justifyContent: "center"}}>
        <Button sx={{marginLeft: 'auto', marginRight: 'auto', marginTop: '5vh', 
          backgroundColor: '#9E70FF', color: 'white', width: '160px', fontSize: '14px', 
          '&:hover': {
            backgroundColor: '#854ffe',
            color: 'white',
          } 
        }}
          onClick = {handleCtaClick}
        >
            Chat with AI
        </Button>
      </Box>
          <Typography sx={{fontSize: "0.8rem", textAlign: "center", color: '#fff', marginTop: '5px', marginBottom: '5px'}}>
            {totalMessages} messages sent
          </Typography>

      <Box component="div">
          <Box component="div" sx = {{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "3vh"}}>
          <Typography component="div" sx={{fontSize: '16px', textDecoration: 'underline', color: '#fff'}} onClick={() => mintNFT()}>
          <Link href="#" sx={{color:"white"}}>Mint NFT</Link>
          </Typography></Box>
          <Box component="div" sx = {{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1vh"}}>
            <Typography component="div" sx={{fontSize: '16px', textDecoration: 'underline', color: '#fff'}} onClick={() => toggleReferralsBox()}>
            <Link href="#" sx={{color:"white"}}>Refer to Earn Points</Link>
          </Typography></Box>
        </Box>
    </Box>

    <Box component="div" sx={{minWidth: "100%", maxHeight: "100vh", overflow: "auto",
        flexWrap: "wrap", position: 'absolute', top: '0px'}}
        display = {displayReferrals}
    >
      <Box sx={{backgroundColor: '#491FA1', paddingTop: '10vh',minWidth: {xxs: "90%", xs: "90%", sm: "90%", md: "60%", lg: "60%", xl: "60%"},
          paddingLeft: {xxs: "5%", xs: "5%", sm: "5%", md: "20%", lg: "20%", xl: "20%"}, 
          paddingRight: {xxs: "5%", xs: "5%", sm: "5%", md: "20%", lg: "20%", xl: "20%"}, 
          overflow: 'auto', justifyContent: 'center', alignItems: 'center'}}>
      <Typography sx={{
          textAlign: "center",
          color: '#ffffff',
          fontSize: '22px',
          fontWeight: '700',
          minHeight: '10vh'
        }} variant="h4" component="div">
        Refer 3Frens
      </Typography>
      <Typography sx={{textAlign: "center", 
          minHeight: '10vh', fontSize: '16px', color: 'white'}}>
        You and your friend earn 1 point when they use your referral link to sign up and purchase credits.
      </Typography>
      <Box sx = {{alignItems: "center", justifyContent: "center",  display:'flex', 
          minHeight: '15vh'}}>
        <Box style={{
          width: '90%',
          background: 'rgb(207 184 255)',
          borderRadius: '10px',
          padding: '10px 20px'
          }}
        >
          {user && <Box><Typography sx={{textAlign: "center", color: '#333333', marginBottom: '5px', fontWeight: '700'}}>
            {referralLink}
          </Typography><Typography sx={{fontSize: "12px", textAlign: "center", color: '#333333'}}>
            Your Unique Referral Link
          </Typography></Box>}
          {!user && <Typography sx={{color: "#333333", fontSize: "16px", paddingLeft: '20px', paddingRight: '20px', paddingTop: '5px', paddingRight: '5px', textAlign: "center", color: '#656565', marginTop: '5px', marginBottom: '10px'}}>
            Connect your wallet to get your unique referral link.
          </Typography>}
        </Box>
      </Box>
      {user && <Typography sx={{minWidth: "100%", textAlign: "center", color: 'white', fontSize: '16px', minHeight: '10vh'}} display="block">
          <Typography sx={{fontSize: "30px", fontWeight: "900", textAlign: "center", color: 'white', marginTop: '5px', marginBottom: '5px'}}>
            {myReferralPoints}
          </Typography>
          <Typography sx={{textAlign: "center", color: 'white', marginTop: '5px', marginBottom: '5vh'}}>
            Your Points
          </Typography>
      </Typography>}
      </Box>
      <Box sx={{ minWidth: "100%", backgroundColor: "#fff0"}}>
      <TableContainer component={Paper} sx={{
          minWidth: {xxs: "90%", xs: "90%", sm: "90%", md: "60%", lg: "60%", xl: "60%"}, 
          maxWidth: {xxs: "90%", xs: "90%", sm: "90%", md: "60%", lg: "60%", xl: "60%"},
          paddingLeft: {xxs: "5%", xs: "5%", sm: "5%", md: "20%", lg: "20%", xl: "20%"}, 
          paddingRight: {xxs: "5%", xs: "5%", sm: "5%", md: "20%", lg: "20%", xl: "20%"},
          backgroundColor: "#fff0",
          boxShadow: "none", border: "none"}}>
      <Table sx={{ color: "white", backgroundColor: "none", maxWidth: "100%"}} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white", fontSize: "18px"}}>User ID</TableCell>
            <TableCell sx={{ color: "white", fontSize: "18px"}} align="right">Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {referralLeaderboard}
        </TableBody>
      </Table>
    </TableContainer>
        
      </Box>
    </Box>
    <Box sx={{width: {xxs: "90%", xs: "90%", sm: "90%", md: "60%", lg: "60%", xl: "60%"},
        paddingLeft: {xxs: "5%", xs: "5%", sm: "5%", md: "20%", lg: "20%", xl: "20%"}, 
        paddingRight: {xxs: "5%", xs: "5%", sm: "5%", md: "20%", lg: "20%", xl: "20%"}, 
        height: '70vh', overflow: 'auto', flexDirection: 'column-reverse', justifyContent: 'center', alignItems: 'center'}} display={displayChat}>
        <Box sx = {{width: '100%', height: '100%', overflow: 'auto', flexDirection: 'column-reverse', display: 'flex'}} >
          {chatBubbles}
        </Box>

    </Box>

    {displayTextInput && <Box sx = {{height: '20vh', background: '#E3E3E3', borderRadius: '15px 15px 0px 0px'}}>
      <Box component="div" sx={{paddingLeft: '5%', paddingRight: '5%'}}>
        
        <TextField fullWidth label={inputLabel} value={inputValue} id="fullWidth" ref={textInput}
          onChange={handleEvent}
          onKeyPress={resetText}
          onClick={() => {
            setDisplayChat("flex");
            setDisplayBanner("none");
          }}
          sx = {{background: '#EBE7FF', marginTop: "2vh", borderRadius: "10px", border: '1px solid #eeeeee'}}
        />
        <Box component="div" sx = {{color: '#5F5F5F', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Typography sx={{fontSize: '12px', marginTop: '1vh', marginBottom: '1vh'}}>
          Credits Left: {credits} | 0.01 ETH for 1000 credits | {TransferEth()}
            </Typography>
        </Box>
        <Box component="div" sx = {{display: 'flex', color: '#5F5F5F', justifyContent: 'center', alignItems: 'center'}}>
          <Typography sx={{fontSize: '10px'}}>
            <Link href = "https://twitter.com/3Frens_">Twitter</Link> | Terms & Conditions | Privacy Policy | 
            <Link href="https://3frens.gitbook.io/welcome-to-3frens/the-basics/frequently-asked-questions" target="_blank">FAQ</Link> | 
            <Link href="https://3frens.gitbook.io/welcome-to-3frens" target="_blank">About Us</Link>
          </Typography>
        </Box>
      </Box>

    </Box>}

    
    
  </Container>
</Container>

);
}



export default App;