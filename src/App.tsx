import { useEffect, useState } from "react";
import axios from 'axios';
import { Button, Loader } from 'rsuite';
import SendIcon from '@rsuite/icons/Send';
import AdminIcon from '@rsuite/icons/Admin';
import PcIcon from '@rsuite/icons/Pc';
import './App.css'
import 'rsuite/dist/rsuite-no-reset.min.css';

let API_BASE = 'https://aihub.instabase.com/api';
let API_TOKEN = 'fLPXLwb3DJKFDEeAFbBNu7M5KXfbcs';
let USER_ID = 'amrbahy1996_gmail.com';

function App() {
  const [file, setFile] = useState(null);
  const [converseID, setConverseID] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [chats, setChats] = useState([
    {
      question: '',
      answer:'',
    },
  ]);

  const handleInputChange = (event:any, setStateFunction:any) => {
    setStateFunction(event.target.value);
  };

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  //to upload the document
  const handleUpload = async () => {
  if (file) {
    const formData = new FormData();
    formData.append(file?.name, file);
    formData.append('enable_object_detection', 'true');
    try {
      const response = await axios.post(
        `${API_BASE}/v2/aihub/converse/conversations?educately=New Conversation&${API_TOKEN}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
          },
        }
      );
      console.log('Response from server:', response?.data);
      setConverseID(response?.data?.id);
    } catch (error:any) {
      console.error('Error uploading file:', error);
      setError(`Error uploading file: ${error.message}`);
    }
  }
};


  //to get the info of the conversation
  useEffect( () => {
    const fetchConversation = async () => {
      try {
        if (converseID) {
          const response = await axios.get(
            `${API_BASE}/v2/aihub/converse/conversations/${converseID}`,
            {
              headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
              },
            }
          );
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    if (converseID) {
      fetchConversation()
    }
  }, [converseID]);

  useEffect(() => {
    setLoading(data?.state === "RUNNING");
    console.log(data);
  }, [data]);

  //to chat with the 
  const askQuestion = async () => {
    try {
      const payload = {
        question: query,
        document_ids: data?.documents[0]?.id,
        mode: 'default',
      };

      const response = await axios.post(`${API_BASE}/v2/aihub/converse/conversations/${converseID}/prompts`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
      });

      if (response.status === 200) {
        const responseJson = response.data;
        console.log('your answer', responseJson)
        setChats([...chats, { question: query, answer: responseJson.answer }]);
        setQuery('');
        setError('');
      } else {
        setError(`Error occurred while asking a question: ${response.statusText}`);
      }
    } catch (error:any) {
      setError(`Error occurred while asking a question: ${error.message}`)
    }
  };

  return (
    <>
      <div className=' bg-[#09090b] w-screen h-screen text-[#fafafa]'>
        <div className="max-w-[900px] mx-6 md:mx-auto pt-[50px]">
          <h4 className="text-[#9b9ba4 text-[20px] md:text-[30px]">Upload your document from you local computer and start chatting!</h4>
          
          {/* upload section */}
          <div className="flex justify-between items-center border-[#fafafa] border p-2 rounded-lg w-full mt-[50px] mb-[10px]">
            <input type='file' onChange={handleFileChange} className="w-full"/>
            <Button active color="blue" appearance="primary" onClick={handleUpload} className="w-[100px] px-1 md:w-[150px]">
              {loading ? <span className="flex items-end"><Loader size="sm" className="mr-1" /><span className="hidden md:block">processing...</span></span> : "Upload File"}
            </Button>
          </div>

          {/* chat section */}
          <div className="shadow-2xl w-full  rounded-md p-4 md:p-[40px] relative border-[#fafafa] border">
            <div className="bg-[#09090b] z-10 flex absolute left-2 right-2 md:left-7 md:right-7 bottom-4 justify-between border border-[#fafafa] rounded-md p-3">
              <input placeholder="ask your question" className="bg-transparent mr-3 border-none w-full outline-none" type='text' value={query} onChange={(e) => handleInputChange(e, setQuery)} />
              <SendIcon color="primary" width={'25px'} className=" cursor-pointer" height={'25px'} onClick={askQuestion} />
            </div>

            <div className="h-[50vh] overflow-x-scroll  pb-[50px]">
              {chats?.length >=1  && chats.map((chat, index) => (
                <div key={index} className="w-full relative">
                  <div className="text-left mb-4 text-[20px]"><AdminIcon />: {chat?.question}</div>
                  <div className="text-right text-[20px]">{chat?.answer} :<PcIcon /></div>
                </div>
              ))}
            </div>
          </div>  
        </div>
      </div>      
    </>
  )
}

export default App;




