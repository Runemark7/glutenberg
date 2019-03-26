import { parse, stringify } from 'qs';
//import axios from 'axios';
/**
 * Appends arguments to the query string of the url
 *
 * @param  {string}	url   URL
 * @param  {Object}	args  Query Args
 *
 * @return {string}       Updated URL
 */
export async function addQueryArgs (url, args) {
  // original
  //console.log(args.search);
  const queryStringIndex = url.indexOf('?');
  const query = queryStringIndex !== -1 ? parse(url.substr(queryStringIndex + 1)) : {};
  const baseUrl = queryStringIndex !== -1 ? url.substr(0, queryStringIndex) : url;
  //const data = await axios.get('http://localhost:5000'+ baseUrl + '/' + args.search);
  //console.log(data);

  return baseUrl + '?' + stringify({ ...query, ...args });
}

