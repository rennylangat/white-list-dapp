const {ethers} = require('hardhat');

async function main(){

    const whiteListContract=await ethers.getContractFactory('WhiteList');

    const deployedWhiteListContract=await whiteListContract.deploy(10);

    await deployedWhiteListContract.deployed();

    console.log("WhiteList contract deployed to: ",deployedWhiteListContract.address);

}

main().then(()=>process.exit(0)).catch(e=>{
    console.log("Error: ",e);
    process.exit(1);
});