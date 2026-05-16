"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Zap, CheckCircle2, ChevronRight } from "lucide-react";

interface Message { role: "user"|"assistant"; content: string; id: string; }
interface CompStatus { state:"idle"|"compiling"|"ready"|"error"; lastCompiled:string|null; filesCompiled:string[]; error:string|null; }
interface Status { compilation: CompStatus; rawFiles: string[]; compiledExists: boolean; }

const SUGGESTIONS = [
  { label:"Who are you?", icon:"👋" },
  { label:"What's your strongest skill?", icon:"⚡" },
  { label:"Tell me about AIRR.", icon:"🏗️" },
  { label:"Are you open to work?", icon:"💼" },
  { label:"What are you building now?", icon:"🔨" },
  { label:"What makes you different?", icon:"🎯" },
];

const LINKS = [
  { label:"LinkedIn",       href:"https://www.linkedin.com/in/tanmaygandhi-code/",                             icon:"🔗" },
  { label:"GitHub",         href:"https://github.com/tanmaygandhi2901",                                        icon:"🐙" },
  { label:"Medium",         href:"https://medium.com/@tanmaygandhi2",                                          icon:"✍️" },
  { label:"Instagram",      href:"https://www.instagram.com/tanmaygandhi.builds",                              icon:"📸" },
  { label:"Context Search", href:"https://chromewebstore.google.com/detail/medpikanoaedpjdkcopaehpmdjnoadij", icon:"🧩" },
  { label:"Email",          href:"mailto:tanmaygandhi2901@gmail.com",                                          icon:"📧" },
];

function Avatar({ size=32, glow=false }:{size?:number;glow?:boolean}) {
  return (
    <div style={{
      width:size,height:size,flexShrink:0,borderRadius:"50%",
      border:"1.5px solid var(--accent)",background:"var(--accent-dim)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*0.3,fontWeight:600,color:"var(--accent)",
      boxShadow:glow?"0 0 0 6px var(--accent-glow)":"none",
      fontFamily:"var(--mono)",letterSpacing:"-0.02em",
    }}>TG</div>
  );
}

function StatusBadge({status}:{status:Status|null}) {
  if (!status) return <span style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--mono)"}}>connecting...</span>;
  const s = status.compilation.state;
  const dot = (color:string) => <span style={{width:7,height:7,borderRadius:"50%",background:color,display:"inline-block",marginRight:5}} />;
  if (s==="compiling") return <span style={{fontSize:11,color:"var(--accent)",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,border:"1.5px solid var(--accent-dim)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}} />compiling wiki...</span>;
  if (s==="ready") return <span style={{fontSize:11,color:"var(--text-2)",fontFamily:"var(--mono)",display:"flex",alignItems:"center"}}>{dot("var(--accent)")}wiki ready · {status.compilation.filesCompiled.length} files</span>;
  if (s==="error") return <span style={{fontSize:11,color:"#f87171",fontFamily:"var(--mono)",display:"flex",alignItems:"center"}}>{dot("#f87171")}compile error</span>;
  return <span style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--mono)",display:"flex",alignItems:"center"}}>{dot("var(--text-3)")}idle</span>;
}

function Bubble({message,isStreaming}:{message:Message;isStreaming?:boolean}) {
  const isUser = message.role==="user";
  return (
    <div className="fade-up" style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",gap:10,alignItems:"flex-start"}}>
      {!isUser && <Avatar size={28} />}
      <div style={{
        maxWidth:"78%",padding:"10px 14px",
        borderRadius:isUser?"14px 4px 14px 14px":"4px 14px 14px 14px",
        background:isUser?"var(--bg-3)":"var(--bg-2)",
        border:`1px solid ${isUser?"var(--border-md)":"var(--border)"}`,
        fontSize:14,lineHeight:1.7,color:"var(--text-1)",
        whiteSpace:"pre-wrap",wordBreak:"break-word",
      }}>
        {message.content}
        {isStreaming && <span className="cursor" />}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="fade-up" style={{display:"flex",gap:10,alignItems:"center"}}>
      <Avatar size={28} />
      <div style={{padding:"10px 16px",borderRadius:"4px 14px 14px 14px",background:"var(--bg-2)",border:"1px solid var(--border)",display:"flex",gap:5}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"var(--text-3)",animation:`blink 1.2s ease ${i*0.2}s infinite`}} />
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages,setMessages] = useState<Message[]>([]);
  const [input,setInput] = useState("");
  const [streaming,setStreaming] = useState(false);
  const [streamText,setStreamText] = useState("");
  const [status,setStatus] = useState<Status|null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{
    const poll = async()=>{
      try { const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status`); if(r.ok) setStatus(await r.json()); } catch{}
    };
    poll();
    const id=setInterval(poll,3000);
    return ()=>clearInterval(id);
  },[]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,streamText]);

  const sendMessage = useCallback(async(text?:string)=>{
    const content=(text??input).trim();
    if(!content||streaming) return;
    if(status?.compilation.state==="compiling") return;

    const userMsg:Message={role:"user",content,id:Date.now().toString()};
    const next=[...messages,userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setStreamText("");

    try {
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:next.map(m=>({role:m.role,content:m.content}))}),
      });
      if(!res.ok) throw new Error(await res.text());
      const reader=res.body!.getReader();
      const decoder=new TextDecoder();
      let acc="";
      while(true){
        const{done,value}=await reader.read();
        if(done) break;
        const lines=decoder.decode(value).split("\n").filter(l=>l.startsWith("data: "));
        for(const line of lines){
          const data=JSON.parse(line.slice(6));
          if(data.done) break;
          if(data.text){acc+=data.text;setStreamText(acc);}
        }
      }
      setMessages(prev=>[...prev,{role:"assistant",content:acc,id:(Date.now()+1).toString()}]);
    } catch {
      setMessages(prev=>[...prev,{role:"assistant",content:"Something went wrong connecting to the server. Please try again.",id:(Date.now()+1).toString()}]);
    } finally {
      setStreaming(false);
      setStreamText("");
      inputRef.current?.focus();
    }
  },[input,streaming,messages,status]);

  const handleKey=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}
  };

  const isCompiling = status?.compilation.state==="compiling";
  const isEmpty = messages.length===0&&!streaming;
  const canSend = input.trim()&&!streaming&&!isCompiling;

  return (
    <div style={{display:"flex",height:"100vh",background:"var(--bg)",overflow:"hidden"}}>

      {/* ── Sidebar ── */}
      <aside style={{width:272,flexShrink:0,borderRight:"1px solid var(--border)",background:"var(--bg-2)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Profile */}
        <div style={{padding:"24px 18px 18px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <Avatar size={42} glow />
            <div>
              <div style={{fontWeight:600,fontSize:14,letterSpacing:"-0.02em"}}>Tanmay Gandhi</div>
              <div style={{fontSize:11,color:"var(--text-2)",marginTop:2,fontFamily:"var(--mono)"}}>Tech Lead · 5.5y exp</div>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {["JS Expert","Next.js","Node.js","LLMs","AWS"].map(t=>(
              <span key={t} style={{fontSize:10,padding:"3px 7px",borderRadius:5,background:"var(--bg-3)",border:"1px solid var(--border-md)",color:"var(--text-2)",fontFamily:"var(--mono)"}}>{t}</span>
            ))}
          </div>
        </div>

        {/* Wiki status */}
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)"}}>
          <div style={{fontSize:10,color:"var(--text-3)",fontFamily:"var(--mono)",letterSpacing:"0.08em",marginBottom:8,textTransform:"uppercase"}}>Knowledge Wiki</div>
          <StatusBadge status={status} />
          {status?.compilation.state==="ready" && (
            <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
              {status.compilation.filesCompiled.map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:5}}>
                  <CheckCircle2 size={9} color="var(--accent)" />
                  <span style={{fontSize:10,color:"var(--text-2)",fontFamily:"var(--mono)"}}>{f}</span>
                </div>
              ))}
              {status.compilation.lastCompiled && (
                <div style={{marginTop:4,fontSize:10,color:"var(--text-3)",fontFamily:"var(--mono)"}}>
                  compiled {new Date(status.compilation.lastCompiled).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div style={{padding:"14px 18px",flex:1,overflowY:"auto"}}>
          <div style={{fontSize:10,color:"var(--text-3)",fontFamily:"var(--mono)",letterSpacing:"0.08em",marginBottom:8,textTransform:"uppercase"}}>Ask me</div>
          {SUGGESTIONS.map(s=>(
            <button key={s.label} onClick={()=>sendMessage(s.label)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,background:"transparent",border:"1px solid transparent",cursor:"pointer",textAlign:"left",color:"var(--text-2)",fontSize:12,fontFamily:"var(--font)",width:"100%",marginBottom:2,transition:"all 0.12s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.cssText+="background:var(--bg-3);border-color:var(--border-md);color:var(--text-1);"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.cssText+="background:transparent;border-color:transparent;color:var(--text-2);"}}
            >
              <span style={{fontSize:13}}>{s.icon}</span>
              <span style={{flex:1,lineHeight:1.4}}>{s.label}</span>
              <ChevronRight size={10} color="var(--text-3)" />
            </button>
          ))}
        </div>

        {/* Links + counter */}
        <div style={{padding:"14px 18px",borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:10,color:"var(--text-3)",fontFamily:"var(--mono)",letterSpacing:"0.08em",marginBottom:8,textTransform:"uppercase"}}>Find Tanmay</div>
          {LINKS.map(l=>(
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",borderRadius:6,color:"var(--text-2)",fontSize:12,textDecoration:"none",marginBottom:2,transition:"all 0.12s",border:"1px solid transparent"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.cssText+="background:var(--bg-3);color:var(--accent);border-color:var(--border-md);"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.cssText+="background:transparent;color:var(--text-2);border-color:transparent;"}}
            >
              <span>{l.icon}</span><span>{l.label}</span>
            </a>
          ))}
          <div style={{marginTop:12,padding:"7px 10px",borderRadius:7,background:"var(--accent-dim)",border:"1px solid rgba(200,241,53,0.15)",display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block",flexShrink:0}} />
            <span style={{fontSize:10,color:"var(--accent)",fontFamily:"var(--mono)"}}>Open to collaborations</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <header style={{padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border)",background:"var(--bg-2)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Zap size={13} color="var(--accent)" />
            <span style={{fontSize:13,fontWeight:500}}>Tanmay Gandhi AI</span>
            <span style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--mono)"}}>· LLM Wiki + Prompt Cache</span>
          </div>
          <StatusBadge status={status} />
        </header>

        {/* Compiling banner */}
        {isCompiling && (
          <div style={{padding:"7px 22px",background:"var(--accent-dim)",borderBottom:"1px solid rgba(200,241,53,0.12)",display:"flex",alignItems:"center",gap:7,fontSize:11,color:"var(--accent)",fontFamily:"var(--mono)",flexShrink:0}}>
            <span style={{width:10,height:10,border:"1.5px solid var(--accent-dim)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block",flexShrink:0}} />
            LLM is synthesizing wiki from {status?.rawFiles.length ?? 0} source files — compiles once, cached for all queries after.
          </div>
        )}

        {/* Messages */}
        <main style={{flex:1,overflowY:"auto",padding:"24px 22px"}}>
          <div style={{maxWidth:660,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
            {isEmpty ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",gap:0}}>
                <Avatar size={60} glow />
                <div style={{marginTop:18,fontSize:20,fontWeight:600,letterSpacing:"-0.03em"}}>
                  {isCompiling ? "Compiling knowledge..." : "Hey, I'm Tanmay's AI."}
                </div>
                <div style={{marginTop:8,fontSize:13,color:"var(--text-2)",maxWidth:360,lineHeight:1.7}}>
                  {isCompiling
                    ? "The LLM is synthesizing the wiki right now. This happens once on startup and whenever files change."
                    : "Ask me anything about Tanmay — skills, projects, experience, or what he's building. I'll answer as him."}
                </div>
                {isCompiling && (
                  <div style={{marginTop:20,padding:"8px 18px",borderRadius:8,background:"var(--accent-dim)",border:"1px solid rgba(200,241,53,0.15)",display:"flex",alignItems:"center",gap:7,fontSize:11,color:"var(--accent)",fontFamily:"var(--mono)"}}>
                    <span style={{width:10,height:10,border:"1.5px solid var(--accent-dim)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}} />
                    Synthesizing {status?.rawFiles.length ?? 0} source files...
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map(m=><Bubble key={m.id} message={m} />)}
                {streaming && streamText && <Bubble message={{role:"assistant",content:streamText,id:"stream"}} isStreaming />}
                {streaming && !streamText && <Thinking />}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Input */}
        <footer style={{padding:"14px 22px",borderTop:"1px solid var(--border)",background:"var(--bg-2)",flexShrink:0}}>
          <div style={{maxWidth:660,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:9,padding:"9px 12px",borderRadius:11,background:"var(--bg-3)",border:"1px solid var(--border-md)",transition:"border-color 0.15s"}}
              onFocus={e=>(e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,241,53,0.25)"}
              onBlur={e=>(e.currentTarget as HTMLDivElement).style.borderColor="var(--border-md)"}
            >
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                disabled={streaming||isCompiling}
                placeholder={isCompiling?"Wiki compiling, please wait...":"Ask anything about Tanmay..."}
                rows={1}
                style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",fontSize:14,lineHeight:1.6,color:"var(--text-1)",fontFamily:"var(--font)",maxHeight:120,overflow:"auto",opacity:isCompiling?0.4:1}}
                onInput={e=>{const el=e.currentTarget;el.style.height="auto";el.style.height=Math.min(el.scrollHeight,120)+"px";}}
              />
              <button onClick={()=>sendMessage()} disabled={!canSend}
                style={{width:30,height:30,flexShrink:0,borderRadius:7,border:"none",cursor:canSend?"pointer":"not-allowed",background:canSend?"var(--accent)":"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",opacity:canSend?1:0.3}}
              >
                <Send size={13} color={canSend?"#000":"var(--text-3)"} />
              </button>
            </div>
            <div style={{marginTop:7,textAlign:"center",fontSize:10,color:"var(--text-3)",fontFamily:"var(--mono)"}}>
              wiki compiled once · prompt cached · not re-processed per request · @tanmaygandhi.builds
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}