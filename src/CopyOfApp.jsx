import React, { Component } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import { useMoralis } from "react-moralis";


class App extends Component{
  constructor(props){
    super(props);
    this.myRef = React.createRef();
    this.handleEvent = this.handleEvent.bind(this);
    this.resetText = this.resetText.bind(this);
    this.addChatBubble = this.addChatBubble.bind(this);
    this.getAIResponse = this.getAIResponse.bind(this);
    this.connectWallet = this.connectWallet.bind(this);
    this.toggleAlert = this.toggleAlert.bind(this);
    
    this.state = {
      inputLabel: 'Type and press enter',
      inputValue: '',
      chatBubbles: null,
      totalMessages: 0,
      errorMessage: null,
      defaultAccount: null,
      userBalance: null,
      connButtonText: 'Connect Wallet',
      connectWalletButton: null,
      alertDisplay: false,
      alertText: 'Sample alert text'
    }
  }




  toggleAlert(state, msg) {
    this.setState({
          alertDisplay: state
      });
    this.setState({
          alertText: msg
      })
	}


	// listen for account changes


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////




  
  async componentDidMount() {
    console.log("launched");
    const response = await fetch(`https://wagmifrennode.nevermaps.repl.co/getMsgNum`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
    const data = await response.json();
    console.log(data.data.msgNum);
    this.setState({
      totalMessages: data.data.msgNum
    });
  }
  async getAIResponse(msg){
    const response = await fetch(`https://wagmifrennode.nevermaps.repl.co/webapp`,     {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query: msg})
    })
    const data = await response.json();
    this.addChatBubble('AI', data.answers[0]);
    console.log(data.answers[0]);
    console.log(data.msgNum);
    this.setState({
      totalMessages: data.msgNum
    });
  }
  connectWallet(){
    console.log("typeof:", typeof web3);
  }
  resetText(event){
    if(event.key==='Enter'){
      this.setState({
        inputValue : ''
      });
      this.addChatBubble('You', event.target.value);
      this.getAIResponse(event.target.value);
      
    }
  }
  addChatBubble(from, msg){
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
    console.log(chatBubble);
    var arr = [];
    arr.push(chatBubble);
    arr.push(this.state.chatBubbles);
    this.setState({
      chatBubbles : arr
    });
  }
  handleEvent(event){
    this.setState({
      inputValue : event.target.value
    });
    if(event.key==='Enter'){
      this.setState({
        inputValue : ''
      });
    }
    event = null;
  }
  render() {
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
      <Collapse in={this.state.alertDisplay}>
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                this.toggleAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {this.state.alertText}
        </Alert>
      </Collapse>
    </Box>
      
      {this.state.connectWalletButton}
      
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
          {this.state.totalMessages}
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
          {this.state.chatBubbles}
      </Box>
      <TextField fullWidth label={this.state.inputLabel} value={this.state.inputValue} id="fullWidth" 
        onChange={this.handleEvent}
        onKeyPress={this.resetText}
        />
<Typography variant="caption" display="block" gutterBottom sx={{marginTop: '5px'}}>
        Credits Left: 10 | 0.01 ETH for 1000 credits | Buy Credits
      </Typography>
    </Box>

      
      <Typography gutterBottom>
        Twitter | Terms & Conditions | Privacy Policy | FAQ | About Us
      </Typography>

      
    </Container></Container>);
  }
}



export default App;