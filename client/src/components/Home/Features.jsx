import React from 'react'
import { Zap } from 'lucide-react'
import Title from './Title';

const Features = () => {
     const [isHover, setIsHover] = React.useState(false);
  return (
    <div id ='features' className='flex flex-col items-center my-10 scroll-mt-12'>
<div className="flex items-center gap-2 text-sm text-shadow-green-400 bg-blue-400/10  rounded-full px-4 py-1">
          <div className="flex items-center gap-2 text-sm text-white bg-pink-500 rounded-full px-4 py-1"></div>  
            
            <Zap width={14}/>
            <span>Create your professional resume in minutes</span>
            
        </div>
<Title title='Build your resume' description='Our streamlined process helps you create professional resumes in minutes with intelligent AI-powered tools and templates'/>
                
            <div className="flex flex-col md:flex-row items-center xl-:mt-10">
                <img className="max-w-2xl w-full xl:-ml-32" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" alt="" />
                <div className="px-4 md:px-0" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                    <div className={"flex items-center justify-center gap-6 max-w-md group cursor-pointer"}>
                        <div className={`p-6 group-hover:bg-violet-100 border border-transparent group-hover:border-violet-300  flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-violet-300 bg-violet-100' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-violet-600"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">AI-Powered Enhancer</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Optimize your professional summaries, job descriptions, and skills with advanced AI feedback.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-green-100 border border-transparent group-hover:border-green-300 flex gap-4 rounded-xl transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-green-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Real-Time A4 Preview</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Watch your changes update instantly in side-by-side, print-perfect PDF/A4 layouts.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-orange-100 border border-transparent group-hover:border-orange-300 flex gap-4 rounded-xl transition-colors">
                            <svg className="size-6 stroke-orange-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Export & Share Instantly</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Download high-quality, ATS-friendly PDFs or publish a secure public URL to send to recruiters.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        

        
        
        </div>
  )
}

export default Features