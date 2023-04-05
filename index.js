const express = require('express');
const ipfsClient = require('ipfs-http-client');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');

const path = require('path')
const fs = require('fs');
const ejs = require('ejs');

const ipfs = ipfsClient({host : 'localhost',port: '5001',protocol:'http'});

const app = express();
var crypto = require('crypto');
app.set('view engine','ejs');
const Web3 = require('web3');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'));

app.use(bodyparser.urlencoded({extended: true}));
app.use(fileUpload());

app.use(express.json());
const contract = require("@truffle/contract");
const HashStorage = contract(require("./eth/build/contracts/HashStorage.json"));

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

const contractAddress = '0x9f1Dc121704C7CBBe948B85D319daBf485429853';


const hashStorageContract = new web3.eth.Contract(HashStorage.abi, contractAddress);


async function addFileToContract(fileHash, ipfsHash, fileName, fileType, dateAdded) {
  const accounts = await web3.eth.getAccounts();
  const ownerAccount = accounts[0]; // Assuming the first account is the contract owner
  await hashStorageContract.methods.add(ipfsHash, fileHash, fileName, fileType, dateAdded)
  .send({ from: ownerAccount, gasPrice: '1000000000' });

}

async function getFileFromContract(fileHash) {
  const fileData = await hashStorageContract.methods.get(fileHash).call();
  return fileData;
}

app.get('/',(req,res)=>{
    res.render('home');
});
app.get('/drop',(req,res)=>{
    res.render('drop');
});
app.get('/file',(req,res)=>{
  res.render('file');
});

app.post('/login',(req,res)=>{
    res.render('login');
});
app.use(express.static(__dirname + '/views'));

app.post('/uploadFile',(req,res)=>{
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/'+fileName;

    file.mv(filePath,async(err)=>{
        if(err){
            console.log("error : while uploading file");
            return res.status(500).send(err);
        }
        const fileHash = await addIpfsFile(fileName, filePath);
        await addFileToContract(fileHash, fileHash, fileName, file.mimetype, Date.now())

        fs.unlink(filePath,(err)=>{
            if(err) console.log(err);
        })
        res.render('upload',{fileName,fileHash});
    })

    
});

const addIpfsFile = async (fileName, filePath) => {
  // Read the original file directly from the filePath
  const fileBuffer = fs.readFileSync(filePath);

  // Add the original file to IPFS
  const fileAdded = await ipfs.add({ path: fileName, content: fileBuffer });

  const { cid } = fileAdded;
  return cid;
};



app.get('/getFile/:fileHash', async (req, res) => {
  const fileHash = req.params.fileHash;
  const fileData = await getFileFromContract(fileHash);

  if (fileData.exist) {
    res.render('file', {
      fileHash: fileData.fileHash,
      ipfsHash: fileData.ipfsHash,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      dateAdded: new Date(fileData.dateAdded * 1000).toLocaleString(),
    });
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(3000,()=>{
    console.log('Server listening on port 3000');
});

