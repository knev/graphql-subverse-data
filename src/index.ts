import path from 'node:path';
import fs from 'node:fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

import { version } from './version.js';

if (process.argv.length < 5) {
    console.log('USAGE: ' + path.basename( process.argv[0]) +' '+ path.basename( process.argv[1]) + ' <address> <port> <working_dir>');
    process.exit(1);
}

const str_address= process.argv[2];
const nr_port= parseInt(process.argv[3]);
const str_working_dir = process.argv[4];
const str_subverse_dir = str_working_dir +'/subverse';

//------------------------------------------------------------------------------------------------------------

const astr_files = fs.readdirSync(str_subverse_dir);
const astr_files_json = astr_files.filter(file => path.extname(file).toLowerCase() === '.json');

const json_combined = [];
for (const f of astr_files_json) {
  const str_path = path.join(str_subverse_dir, f);
  const str_read = fs.readFileSync(str_path, 'utf-8');
  const json_read = JSON.parse(str_read);
  json_combined.push(json_read);
}

const str_path_typeDefs= path.join(str_working_dir, 'schema.graphqls');
const str_typeDefs = fs.readFileSync(str_path_typeDefs, 'utf-8');

//------------------------------------------------------------------------------------------------------------

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
	Query: {
		subverse: () => json_combined,
	}
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
	typeDefs: str_typeDefs,
	resolvers,
	// plugins: [ApolloServerPluginLandingPageDisabled()],
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, { listen: { host: str_address, port: nr_port } });

console.log(`graphql-subverse-data@${version}, listening at: ${url}`);
console.log(`working directory: ${str_working_dir}`);

