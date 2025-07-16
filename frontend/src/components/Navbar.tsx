"use client"

import Link from "next/link";
import { useState } from "react"
import { Button } from "./ui/button";
import { CircleUser, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/context";

const Navbar = () => {
    const { isAuth, loading } = useAppData();

    const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-4 shadow-md z-40 bg-white">
        <div className="container mx-auto flex-bc">
            <Link href={"/"}>Bloggen</Link>

            <div className="md:hidden">
                <Button onClick={()=>setIsOpen(!isOpen)} variant={"ghost"}>
                    {isOpen? <X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}
                </Button>
            </div>

            <ul className="hidden md:flex gap-4 text-gray-700">
                <li><Link href={'/'} className="hover:text-blue-600">Home</Link></li>
                <li><Link href={'/blog/saved'} className="hover:text-blue-600">Saved Blogs</Link></li>

                {loading?" ":
                <li>{ isAuth?
                    <Link href={'/profile'}> <CircleUser/> </Link> : 
                    <Link href={'/login'} className="hover:text-blue-600"><LogIn/></Link>
                }</li> }
                
            </ul>
        </div>
        <div className={cn("md:hidden overflow-hidden transition-all duration-300 ease-in-out", isOpen?"max-h-40 opacity-100":"max-h-0 opacity-0")}>
            <ul className="flex-cc flex-col space-y-4 p-4 text-gray-700 shadow-md bg-white">
                <li><Link href={'/'} className="hover:text-blue-600">Home</Link></li>
                <li><Link href={'/blog/saved'} className="hover:text-blue-600">Saved Blogs</Link></li>
                <li><Link href={'/login'} className="hover:text-blue-600"><LogIn/></Link></li>
            </ul>
        </div>
    </nav>
  )
}

export default Navbar