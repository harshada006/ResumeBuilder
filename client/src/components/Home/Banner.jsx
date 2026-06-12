import React from 'react'
import { Link } from 'react-router-dom'

const Banner = () => {
    return (
        
        <div className="flex flex-wrap items-center justify-center w-full py-2 font-medium text-sm text-white text-center bg-gradient-to-b from-pink-500 to-rose-600">
            <p className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold bg-white text-pink-600 rounded-full">
                    New
                </span>
                AI Feature Added
            </p>

            <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1 text-xs rounded-md text-pink-600 bg-white hover:bg-pink-100 transition active:scale-95 ml-3"
            >
                Check it out
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.91797 7H11.0846" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 2.9165L11.0833 6.99984L7 11.0832" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Link>
        </div>
        
    )
}

export default Banner