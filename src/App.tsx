import { useEffect, useState } from "react";
import axios from 'axios';
import { Button, Divider, Loader,Notification} from 'rsuite';
import SendIcon from '@rsuite/icons/Send';
import AdminIcon from '@rsuite/icons/Admin';
import PcIcon from '@rsuite/icons/Pc';
import './App.css'
import 'rsuite/dist/rsuite-no-reset.min.css';

let API_BASE = 'https://aihub.instabase.com/api';
let API_TOKEN = 'fLPXLwb3DJKFDEeAFbBNu7M5KXfbcs';
let USER_ID = 'amrbahy1996_gmail.com';
let WORK_SPACE = 'my-repo';


interface DocumentType {
  id: number;
  name: string;
}

interface ConversationDataType {
  created_at_ms: string;
  description: string;
  documents: DocumentType[];
  drive_state: string;
  id: string;
  name: string;
  owner: string;
  state: 'RUNNING' | 'COMPLETE';
  status: string;
  updated_at_ms: string;
}


function App() {
  const [file, setFile] = useState<File | null>(null);
  const [enableUpload, setEnableUpload] = useState(true);
  const [converseID, setConverseID] = useState('');
  const [query, setQuery] = useState('');
  // @ts-ignore
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [data, setData] = useState<ConversationDataType | null>(null);
  const [chats, setChats] = useState<{ question: string; answer: string }[]>([]);
  const [messageText, setMessageText] = useState('');
  const [processLoad, setProcessLoad] = useState(false);

  const handleInputChange = (event:any, setStateFunction:any) => {
    setStateFunction(event.target.value);
  };

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0])
  };

  //to upload the document
  const handleUpload = async () => {
    if (file) {
      setData(null)
      const formData = new FormData();
      // @ts-ignore
      formData.append(file?.name, file);
      formData.append('org', USER_ID);
      formData.append('workspace', WORK_SPACE);
      formData.append('name', 'instabase test app');
      formData.append('description', 'using simple api for testing');
      formData.append('enable_object_detection', 'true');
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/v2/aihub/converse/conversations?educately=New Conversation&${API_TOKEN}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${API_TOKEN}`,
              'IB-Context': `${USER_ID}`
            }
          }
        );
        setConverseID(response?.data?.id);
        setLoading(false);
      } catch (error: any) {}
    }
  };
  
  useEffect(() => {
    setEnableUpload(!file);
  }, [file]);

  //to get the info of the conversation
  // to get the info of the conversation
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await axios.get(`${API_BASE}/v2/aihub/converse/conversations/${converseID}`, {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'IB-Context': `${USER_ID}`
          },
        });

        const conversationData = response.data;
        setData(conversationData);

        if (conversationData.state === 'RUNNING') {
          setTimeout(fetchConversation, 1000);
          setProcessLoad(true);
        } else if (conversationData.state === 'COMPLETE') {
          setProcessLoad(false);
        }
      } catch (error) {}
    };

    if (converseID) {
      fetchConversation();
    }
  }, [converseID]);


  //to chat with the api
  const askQuestion = async () => {
    if (data?.state === 'COMPLETE' && data?.documents[0]?.id) {
      try {
        const payload = {
          question: query,
          // @ts-ignore
          document_ids: [data?.documents[0]?.id],
          mode: 'default',
        };

        const response = await axios.post(`${API_BASE}/v2/aihub/converse/conversations/${converseID}/prompts`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_TOKEN}`,
            'IB-Context': `${USER_ID}`
          },
        });

        if (response.status === 200) {
          setQuery('');
          setError('');
          const responseJson = response.data;
          setChats([...chats, { question: query, answer: responseJson.answer }]);
        }
      } catch (error:any) {
        
      }
    } else {
      setMessageText(data?.status || '');
      setTimeout(() => {
        setMessageText('');
      }, 3000)
    }
  };

  const Message = () => (
    <Notification  type='info' className="min-w-[300px] shadow-xl bg-[#222] absolute top-5 md:right-5 mx-6" closable>
      <p className="text-[#fafafa] text-[20px]">{messageText}</p>
    </Notification>
  );


  return (
    <>
      <div className=' bg-[#09090b] w-screen h-screen text-[#fafafa]'>
        <div className="max-w-[900px] mx-6 md:mx-auto pt-[50px]">
          <h4 className="text-[#9b9ba4 text-[20px] md:text-[30px]">Upload your document from you local computer and start chatting!</h4>
          
          {/* upload section */}
          <div className="flex justify-between items-center border-[#fafafa] border p-2 rounded-lg w-full mt-[50px] mb-[10px]">
            <input type='file' onChange={handleFileChange} className="w-full"/>
            <Button disabled={enableUpload} active color="blue" appearance="primary" onClick={handleUpload} className="w-[100px] px-1 md:w-[150px]">
              {loading ? <span className="flex items-end"><Loader size="sm" className="mr-1" /><span className="hidden md:block">processing...</span></span> : "Upload File"}
            </Button>
          </div>

          {/* chat section */}
          <div className="shadow-2xl w-full  rounded-md p-4 md:p-[40px] relative border-[#fafafa] border">
            <div className="bg-[#09090b] z-10 flex absolute left-2 right-2 md:left-7 md:right-7 bottom-4 justify-between border border-[#fafafa] rounded-md p-3">
              <input placeholder="ask your question" className="bg-transparent mr-3 border-none w-full outline-none" type='text' value={query} onChange={(e) => handleInputChange(e, setQuery)} />
              <Button active color="blue" onClick={askQuestion}>
                <SendIcon color='black' width={'20px'} height={'20px'} />
              </Button>
            </div>

            <div className="h-[50vh] overflow-x-scroll  pb-[50px]">
              {chats?.length >=1 && chats.map((chat, index) => (
                <div key={index} className="w-full relative">
                  <div className="text-left mb-4 text-[22px] md:leading-[35px] md:text-[24px]"><AdminIcon /><span className="ml-1">:{chat?.question}</span></div>
                  <div className="text-left text-[18px] md:text-[20px] md:leading-[30px]"><PcIcon /> {' '}<span className="ml-1">:{chat?.answer}</span></div>
                  <Divider />
                </div>
              ))}
            </div>
            {processLoad &&
              <div className="min-w-max absolute top-[30%] left-0 right-0 flex justify-center items-center">
                <Loader size="sm" color="white" />
                <span className="ml-2">Processing the document...</span>
              </div>
            }
          </div>  
        </div>
      </div>     
      {messageText && <Message />}
    </>
  )
}

export default App;