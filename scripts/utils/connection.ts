import {Connection} from "@solana/web3.js";
import {url} from './url'

export async function getConnection(): Promise<Connection> {
    const connection = new Connection(url, 'recent',);
    const version = await connection.getVersion();

    console.log('Connection to cluster established:', url, version);

    return connection;
}
