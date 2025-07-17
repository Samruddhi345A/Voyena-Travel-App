import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import { MobileSidebar, NavItems } from 'components';
import { use } from 'react';
import { Outlet, redirect } from 'react-router'


 export async function clientLoader(){
        try{
            const res= await fetch('http://localhost:5000/api/auth/user',{credentials:"include"})
            
            const user= await res.json()
            if(!user || !user._id){
                
                return redirect("/sign-in")
            }
            
            if(user.status === "user"){
                return redirect("/")
            }
            return user?._id? user : null
        }catch(err){
            console.log("Error Fetching User",err)
             return redirect("/")
            
    }
    }

const adminLayout = () => {
  return (
    <div className='admin-layout'>
       <MobileSidebar/>
        <aside className='w-full max-w-[270px] hidden lg:block'>
            <SidebarComponent width={270} enableGestures={false} >
              <NavItems handleClick={function (): void {
            throw new Error('Function not implemented.');
          } }/>

            </SidebarComponent>
        </aside>
        <aside className='children'>
        <Outlet/>
        </aside>
        </div>
  )
}

export default adminLayout