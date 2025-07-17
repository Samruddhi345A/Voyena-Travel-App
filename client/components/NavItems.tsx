import { cn } from "lib/utils"
import { Link, NavLink, useLoaderData, useNavigate } from "react-router"
import { sidebarItems } from "~/constants"

const NavItems = ({handleClick}:{handleClick:()=>void}) => {
    const user = useLoaderData()
    const navigate = useNavigate()
    console.log(user)
    const  handleLogout = async() => {
        try{
            await fetch("http://localhost:5000/api/auth/logout",{method:"GET",credentials:"include"})
            navigate("/sign-in")
        }catch(err){
            console.log("Logout failed",err)
        }
    }
    return (
        <section className="nav-items">
            <Link to='/' className='link-logo'>
                <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px] " />
                <h1>
                    Voyena
                </h1>
            </Link>
            <div className="container">
                <nav>
                    {sidebarItems.map(({ id, href, icon, label }) => (
                        <NavLink key={id} to={href} >
                            {({ isActive }: { isActive: boolean }) => (
                                <div className={cn('group nav-item', {
                                    'bg-primary-100 !text-white': isActive
                                })} onClick={handleClick}>
                                    <img src={icon} alt={label} className={`size-0 group-hover:brightness-0 group-hover:invert ${isActive ? 'brightness-0 invert' : 'text-dark-200'}`} />
                                    {label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <footer className="nav-footer">
                    <img src={user?.imageUrl || '/assets/images/david.wedp'} alt={user?.name || "user"} />

                    <article>
                        <h3>{user?.name}</h3>
                        <p>{user?.email}</p>
                    </article>
                    <button className="cursor-pointer" onClick={handleLogout}>
                        <img src="/assets/icons/logout.svg" className="size-6" alt="logout" />
                    </button>
                </footer>
            </div>
        </section>
    )
}

export default NavItems