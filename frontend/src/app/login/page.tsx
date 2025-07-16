"use client";

import React, {  useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import {  useAppData, user_service } from "@/context/context";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

function LoginPage() {
  const { isAuth, setIsAuth, loading } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (isAuth) router.push("/");
  }, [isAuth, router]);

  const googleRes = async (authResult: any) => {
    try {
      const result = await axios.post(
              `${user_service}/api/login`,
              { code: authResult.code },
              { withCredentials: true }
            );

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });

      toast.success(result.data.message);
      setIsAuth(true);
    } catch (error) {
      console.log("login error:", error);
      toast.error("Login error");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: googleRes,
    onError: googleRes,
    flow: "auth-code",
  });

  return (
   <>{loading? <Loading/> : <div className="w-full h-[90vh] flex-cc">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to The Bloggen.</CardTitle>
          <CardDescription>Your go to bloggen app.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={googleLogin}>Login With Google</Button>
        </CardContent>
      </Card>
    </div>
    
   }
   </>
  );
}

export default LoginPage;
