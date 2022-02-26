import { useState } from 'react';
import {
    ChakraProvider,
    Box,
    Text,
    Link,
    Stack,
    Code,
    Grid,
    theme,
    Flex, Input, IconButton
} from '@chakra-ui/react';
import { MdSearch } from 'react-icons/md'
import {get_params} from "../utils";

function onInputChange(e, setInput, setSearchResult) {
    setInput(e.currentTarget.value);
    if (e.key === 'Enter') {
        search(e.currentTarget.value, setSearchResult);
    }
}

function search(query, setSearchResults) {
    console.log(query)
    if (query.startsWith('https://www.youtube.com') || query.startsWith('https://youtu.be')) {
        let url = new URLSearchParams('?' + query.split('?')[1]);
        console.log(url.get('list'))
        if (url.get('list')) {
            fetch('https://www.googleapis.com/youtube/v3/playlistItems?' + get_params({
                part: 'snippet',
                playlistId: url.get('list'),
                key: process.env.REACT_APP_GOOGLE_API_KEY
            })).then(async r => {
                let response = await r.json()
                console.log(response)
                let res = response.items?.map(item => {
                    return {
                        id: item.id.videoId,
                        author: item.snippet.channelTitle,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.default.url
                    }
                });
                setSearchResults(res);
            })
        } else if (url.get('v') || query.startsWith('https://youtu.be')) {
            let id = url.get('v');
            if (query.startsWith('https://youtu.be')) {
                let front = query.split('?')[0].split('/')
                id = front[front.length - 1];
            }
            fetch('https://www.googleapis.com/youtube/v3/videos?' + get_params({
                part: 'snippet',
                id: id,
                key: process.env.REACT_APP_GOOGLE_API_KEY
            })).then(async r => {
                let response = await r.json()
                let res = response.items?.map(item => {
                    return {
                        id: item.id.videoId,
                        author: item.snippet.channelTitle,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.default.url
                    }
                });
                setSearchResults(res);
            })
        }
    } else {
        fetch('https://www.googleapis.com/youtube/v3/search?' + get_params({
            q: query,
            part: 'snippet',
            key: process.env.REACT_APP_GOOGLE_API_KEY
        })).then(async r => {
            let response = await r.json()
            let res = response.items?.map(item => {
                return {
                    id: item.id.videoId,
                    author: item.snippet.channelTitle,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url
                }
            });
            setSearchResults(res);
        });
    }
}


export default function SearchBar({setSearchResult}) {
    const [input, setInput] = useState('');
    return (
        <Flex justify="center">
            <Input placeholder='Search' size='lg' bg="#F2CC8F" onKeyDown={e => onInputChange(e, setInput, setSearchResult)}
                   onPaste = {e => setInput(e.clipboardData.getData('Text'))}/>
            <IconButton aria-label='fuck blind people' icon={<MdSearch />} onClick={() => search(input, setSearchResult)} />
        </Flex>
    );
}
