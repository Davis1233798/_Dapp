import {
    Button, Container, Text,
    Image, Box, Link,
    Skeleton,Flex,VStack,HStack,Spacer
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAccount, useContractRead, useContractWrite, useBalance, useFeeData } from 'wagmi';
import abiFile from '../contracts/ERC721A.json';
import ReactCardFlip from 'react-card-flip';
import useAnimateNumber from 'use-animate-number';

let CONTRACT_ADDRESS = '0x1Fb2c456173B564AA2e37Cee8bCdB66CA55213cB';
CONTRACT_ADDRESS = CONTRACT_ADDRESS.toLowerCase();
const getOpenSeaURL = (tokenId: string | number) =>
    `https://goerli.pixxiti.com/nfts/${CONTRACT_ADDRESS}/${tokenId}`;
//`https://gateway.pinata.cloud/ipfs/QmYQG6c7BMdTQNk6n4kNJiYhpareb1pgCSrSGvXoe7qXmw/${tokenId}.png`;
const Contract_View = `https://goerli.etherscan.io/address/${CONTRACT_ADDRESS}`;

const blindURI = 'https://gateway.pinata.cloud/ipfs/Qmf8oauEnvxTG2zPdhrt2SFkfbXkBqNZKtBPedbM6SBAxm/0';
const getImgURL = (tokenId: string | number) =>
    //`https://goerli.pixxiti.com/nfts/${CONTRACT_ADDRESS}/${tokenId}`;
    `https://gateway.pinata.cloud/ipfs/QmYQG6c7BMdTQNk6n4kNJiYhpareb1pgCSrSGvXoe7qXmw/${tokenId}.png`;

function Erc721A() {
    const contractConfig = {
        addressOrName: CONTRACT_ADDRESS,
        contractInterface: abiFile.abi,
    };

    const [imgURL, setImgURL] = useState('');

    const { writeAsync: mint, error: mintError } = useContractWrite({
        ...contractConfig,
        functionName: 'gift',
    });
    const [mintLoading, setMintLoading] = useState(false);
    const { address } = useAccount();
    const isConnected = !!address;
    const [mintedTokenId, setMintedTokenId] = useState(0);
    //const [totalMinted, setTotalMinted] = useState(0);
    const [totalMinted, setTotalMinted] = useAnimateNumber(0);
    const { data: totalSupplyData } = useContractRead({
        ...contractConfig,
        functionName: 'totalSupply',
        watch: true
    });
    useEffect(() => {
        if (totalSupplyData) {
            setTotalMinted(totalSupplyData.toNumber(),true);
        }
    }, [totalSupplyData]);
    const onMintClick = async () => {
        try {
            setMintLoading(true);
            const tx = await mint({
                args: [address, 1],
            });
            const receipt = await tx.wait();
            console.log('TX receipt', receipt);
            // @ts-ignore
            const mintedTokenId = await receipt.events[0].args[2].toString();
            setMintedTokenId(mintedTokenId);
        } catch (error) {
            console.error(error);
        } finally {
            setMintLoading(false);
        }
    };
    const contractURL = (ADDRESS: string) => `https://goerli.etherscan.io/address/${ADDRESS}#code`;
    const [flip, setFlip] = useState(false);
    

    return (
        <Container maxW='900px' p={0}>
        <Flex h="100vh" >
            <VStack
            w='50%'
            h='full'
            p={5}
            alignItems="flex-start">

            {/* <Text marginTop='4'>This is the NFT we will be minting!</Text> */}
            {/* <Link as={'`https://goerli.etherscan.io/address/${ContractAddress}`'}>Contract</Link> */}
            <p style={{ margin: '0 0 5px' }}>
                Total Erc721A NFT Minted :－{totalMinted} 
            </p>
            <ReactCardFlip isFlipped={mintedTokenId == 0 ? flip : !flip}
                flipDirection="horizontal">
                <div style={{
                    // width: '300px',
                    // height: '300px',
                    background: '#d7fbda',
                    // fontSize: '40px',
                    color: 'green',
                    borderRadius: '30px',
                }}>
                    <Image src={getImgURL(mintedTokenId)}
                        width="100%"
                        height="100%"
                        borderRadius='30px'
                    />
                </div>
                <div style={{
                    background: '#fbd7f8',
                    color: 'blue',
                    borderRadius: '30px',
                }}>
                    <Image src={getImgURL(mintedTokenId)}
                        width="100%"
                        height="100%"
                        borderRadius='30px'
                    />
                </div>
            </ReactCardFlip>
            </VStack>
            <Spacer />
            <VStack>
            <Text>
                <Link
                    isExternal
                    href={contractURL(CONTRACT_ADDRESS)}
                    color='blue'
                    textDecoration='underline'
                >
                    <Button>Contract source code</Button>
                </Link>

            </Text>
            <Button
                disabled={!isConnected || mintLoading || mintedTokenId != 0}
                marginTop='6'
                onClick={onMintClick}
                textColor='white'
                bg='linear-gradient(#e66465, #9198e5)'
                _hover={{
                    bg: 'linear-gradient(#de3e3f, #727ce0)',
                }}
            >
                {isConnected ? '🎉 Mint' : '🎉 Mint (Connect Wallet)'}
            </Button>
            

            {
                mintError && (
                    <Text marginTop='4'>⛔️ Mint unsuccessful! Error message:</Text>
                )
            }

            {
                mintError && (
                    <pre style={{ marginTop: '8px', color: 'red' }}>
                        <code>{JSON.stringify(mintError.message, null, ' ')}</code>
                    </pre>
                )
            }
            {mintLoading && <Text marginTop='2'>Minting... please wait</Text>}

            {
                (mintedTokenId == 0 ? '' : mintedTokenId) && (
                    <Text marginTop='2'>
                        🥳 Mint successful! You can view your NFT {' '}
                        <Link
                            isExternal
                            href={getOpenSeaURL(mintedTokenId)}
                            color='blue'
                            textDecoration='underline'
                        >
                            here!
                        </Link>

                    </Text>
                )
            }
            </VStack>

        </Flex> 
    </Container >
    )
}


export default Erc721A
