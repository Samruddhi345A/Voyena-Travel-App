import { Header } from 'components'
import { GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids'
import { cn, formatDate } from 'lib/utils'
import type { Route } from './+types/all-users'

export const loader = async () => {
  
  const {users,total}= await fetch( `${import.meta.env.VITE_API_URL}/api/users/allusers?limit=10&offset=0`,{
    credentials:"include"
  }).then(res=>res.json())
  
  return {users,total}
}

const allUsers = ({loaderData}:Route.ComponentProps) => {
  const {users,total}=loaderData
  return (
     <main className='all-users wrapper'>
    <Header title="Manage Users"
        description="Filter, sort and access detailed user profiles"
    />

    <GridComponent dataSource={users} gridLines='None'>
      <ColumnsDirective>
      
      <ColumnDirective 
       field='name' headerText='Name' width='200' textAlign='Left' 
       template={(props:UserData)=>(
        <div className='flex items-center gap-1.5'>
          <img src={props.imageUrl} className='aspect-square size-8 rounded-full' alt={props.name} referrerPolicy='no-referrer' />
          <span >{props.name}</span>
        </div>
       )}
       />

       <ColumnDirective field='email' headerText='Email' width='200' textAlign='Left' />

       <ColumnDirective field='joinedAt' headerText='Date Joined' width='140' textAlign='Left' 
       template={({joinedAt}:{joinedAt:string})=>formatDate(joinedAt) }/>
       <ColumnDirective field="status" headerText="Status" width='100' textAlign='Left'
       template={({status}:UserData)=>(
         <article className={cn("status-column", status ==="user"?"bg-success-50":"bg-light-100")}>
          <div className={cn("size-1.5 rounded-full", status ==="user"?"bg-success-500":"bg-gray-100")}></div>
            <h3 className={cn("font-inter text-xs font-medium", status ==="user"?"text-success-700":"text-gray-500")}>
              {status}
            </h3>
          
         </article>
       )}
       />
      </ColumnsDirective>
    </GridComponent>
   </main>
  )
}

export default allUsers