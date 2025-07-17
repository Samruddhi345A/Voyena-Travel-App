import { ButtonComponent } from '@syncfusion/ej2-react-buttons'
import React from 'react'
import { Link, redirect } from 'react-router'

  export async function clientLoader(){
        try{
            const res= await fetch('http://localhost:5000/api/auth/user',{credentials:"include"})
            
            const user= await res.json()
             console.log(user)
            if(user && user._id){
                
                return redirect("/")
            }
            return null
        }catch(err){
            console.log("Error Fetching User",err)
             return null
            
    }
    }

const SignIn = () => {

  
    const handleSignIn = () => {
       window.open('http://localhost:5000/api/auth/google', '_self');
    }

  return (
    <main className='auth'> 
        <section className='size-full glassmorphism flex-center px-6'>
    <div className='sign-in-card'>
<header className='header'>
    <Link to='/'>
    <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px] " />
    
    </Link>
    <h1 className='p-28-bold text-dark-100'>
        Voyena 
    </h1>
</header>
<article>
    <h2 className='p-28-semibold text-dark-100 text-center'>
        Start your travel journey
    </h2>
    <p className='p-18-regular text-gray-100 text-center !leading-7'>
       Sign In with google to manage destinations, iteraries and user activities with ease.
    </p>
</article>
<ButtonComponent type='button' className='button-class !h-11 !w-full' iconCss='e-search-icon'
onClick={handleSignIn}>
    <img src='/assets/icons/google.svg' alt="google"  className='size-5' />
    <span className='p-18-semibold text-white'>
        Sign In with Google
    </span>
</ButtonComponent>
    </div>
        </section>
    </main>
  )
}

export default SignIn