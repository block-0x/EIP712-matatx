import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import "./App.css";
var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
    const response = await contract.methods.get().call();
    this.setState({ storageValue: response });
  };

  signData = async () => {
    const { web3, accounts, contract } = this.state;
    var signer = accounts[0];


    var deadline = Date.now() + 100000;
    var x = 157;

    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: "2.0"
    }, function (err, result) {
      const netId = result.result;
      const msgParams = JSON.stringify({types:
        {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
          {name:"verifyingContract",type:"address"}
        ],
        set:[
          {name:"sender",type:"address"},
          {name:"x",type:"uint"},
          {name:"deadline", type:"uint"}
        ]
      },
      //make sure to replace verifyingContract with address of deployed contract
      primaryType:"set",
      domain:{name:"SetTest",version:"1",chainId:netId,verifyingContract:"0x803B558Fd23967F9d37BaFe2764329327f45e89E"},
      message:{
        sender: signer,
        x: x,
        deadline: deadline
      }
      })

      var from = signer;

    
      var params = [from, msgParams]
      console.dir(params)
      var method = 'eth_signTypedData_v3'
    
      web3.currentProvider.sendAsync({
        method,
        params,
        from,
      }, async function (err, result) {
        if (err) return console.dir(err)
        if (result.error) {
          alert(result.error.message)
        }
        if (result.error) return console.error('ERROR', result)
    
        const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: result.result })
    
        if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
          alert('Successfully ecRecovered signer as ' + from)
        } else {
          alert('Failed to verify signer when comparing ' + result + ' to ' + from)
        }

        //getting r s v from a signature
        const signature = result.result.substring(2);
        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64, 128);
        const v = parseInt(signature.substring(128, 130), 16);

        await contract.methods.executeSetIfSignatureMatch(v,r,s,signer, deadline, x).send({ from: accounts[0] });
      }) 
    })
  }
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h2>EIP 712 Example</h2>
        <div>The stored value is: {this.state.storageValue}</div>
        <button onClick={() => this.signData()}> Press to sign </button>
      </div>
    );
  }
}

export default App;
