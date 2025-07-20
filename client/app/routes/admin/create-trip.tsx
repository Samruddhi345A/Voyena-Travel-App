import { Header } from 'components'
import React, { useState } from 'react'
import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import {LayerDirective, LayersDirective, LayerSettings, MapsComponent} from '@syncfusion/ej2-react-maps';
import type { Route } from './+types/create-trip';

type CreateTripResponse = {
    id: any;
    
    // add other properties as needed
};
import { comboBoxItems, selectItems } from '~/constants';
import { cn, formatKey } from 'lib/utils';
import { world_map } from '~/constants/world_map';
import { Button, ButtonComponent } from '@syncfusion/ej2-react-buttons';
import type { C } from 'node_modules/react-router/dist/development/route-data-D7Xbr_Ww.mjs';
import { useNavigate } from 'react-router';

export const loader = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,latlng,flag,maps");
    const data = await response.json();
    
    return data.map((country: any) => ({ name: 
        country.flag+country.name.common, 
        coordinates: country.latlng,
        value: country.name.common,
        openStreetMap: country.maps?.openStreetMap,
    }))
}
const createTrip = ({loaderData}:Route.ComponentProps) => {

     const countries = loaderData as Country[]

    const [formData,setFormData]=useState<TripFormData>({
        country: countries[0]?.name || "",
        travelStyle: "",
        interest: "",
        budget: "",
        duration: 0,
        groupType: "",  
    })
   
    const [error, seterror] = useState<string | null>(null)
    const [loading, setloading] = useState(false)
    const countryData = countries.map((country) => ({text: country.name, value: country.value}))
    const navigate = useNavigate();
    const mapData=[
        {
            country:formData.country,
            color:'#EA382E',
            coordinates:countries.find((country:Country) => country.name === formData.country)?.coordinates
        }
    ]

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setloading(true)
        if(!formData.country || !formData.travelStyle || !formData.interest || !formData.budget || !formData.duration || !formData.groupType){
            seterror("All fields are required")
            setloading(false)
            return
        }

        if(formData.duration < 1 || formData.duration > 10){
            seterror("Duration must be between 1 and 10")
            setloading(false)
            return
        }   
        
        try {
            const response = await fetch("http://localhost:5000/api/auth/user", {
                credentials: "include",
            });
            const user = await response.json();
            if (!user || !user._id) {
                console.log("User not authenticated")
                setloading(false)
                return
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/create-trips`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        country:formData.country,
                        travelStyle: formData.travelStyle,  
                        interests: formData.interest,
                        budget: formData.budget,
                        duration: formData.duration,
                        groupType: formData.groupType
                        , userId: user._id }),
                    credentials: "include"
                });
                const result : CreateTripResponse = await response.json();
                if(result?.id){
                    navigate(`/trips/${result.id}`);
                }else{
                    console.log("Failed to create trip");
                }
                seterror(null)
            } catch (err) {
                console.log("Error Generating Trip", err)
            } finally {
                setloading(false)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({ ...formData, [key]: value });
    }
  return (
<main className='flex flex-col gap-10 pb-20 wrapper'>
    <Header title="Add a new trip"
        description="View and Edit AI Generated Travel Plans"
    />
    <section className='mt-2.5 wrapper-md'>
<form className='trip-form' onSubmit={handleSubmit}>
<div>
    <label htmlFor="country">Country</label>
   <ComboBoxComponent id="country" dataSource={countryData}
   fields={{text:"text",value:"value"}}
   placeholder='Select a country'
   className='combo-box'
   change={(e:{value:string|undefined}) => {
    if(e.value){
        handleChange("country",e.value)
    }
   }}
   allowFiltering
   filtering={(e)=>{
    const query = e.text.toLowerCase();
    
    e.updateData(
        countries.filter((country) => country.name.toLowerCase().includes(query)).map((country) => ({text: country.name, value: country.value})))

    ;
   }}
   />
</div>
<div>
    <label htmlFor="duration">Duration</label>
    <input type="number" name="duration" id="duration" placeholder='Enter duration in days' onChange={(e) => handleChange("duration",Number(e.target.value))} className='form-input placeholder:text-gray-100'/>
</div>
{selectItems.map((key)=>(
    <div key={key}>
        <label htmlFor={key}>{formatKey(key)}</label>
        <ComboBoxComponent className='combo-box'
        id={key}
        dataSource={comboBoxItems[key].map((item) => ({text: item, value: item}))}
        fields={{text:"text",value:"value"}}
        placeholder={`Select ${formatKey(key)}`}
         change={(e:{value:string|undefined}) => {
    if(e.value){
        handleChange(key,e.value)
    }
   }}
   allowFiltering
   filtering={(e)=>{
    const query = e.text.toLowerCase();
    
    e.updateData(
        comboBoxItems[key].filter((item) => item.toLowerCase().includes(query)).map((item) => ({text: item, value: item})))

    ;
   }}
        />
    </div>  
))}

<div>
   <label htmlFor='location'>Location on the World Map</label>
   <MapsComponent >
<LayersDirective>
<LayerDirective
shapeData={world_map}
dataSource={mapData}
shapePropertyPath='name'
shapeDataPath='country'
shapeSettings={{colorValuePath: 'color',fill:'#e5e5e5'}}
/>
</LayersDirective>

   </MapsComponent>
</div >

<div className='bg-gray-200 h-px w-full'></div>
{error && <p className='text-red-500'>{error}</p>}
<ButtonComponent type='submit' className='button-class !h-12 !w-full' disabled={loading} iconCss='e-search-icon'>

    <img src={`/assets/icons/${loading ? 'loader' : 'magic-star'}.svg`} alt="submit" className={cn("size-7", {'animate-spin': loading})} />
    <span className='p-16-semibold text-white'>{loading ? 'Generating...' : 'Generate Trip'}</span>
</ButtonComponent>
</form>
    </section>
    </main>
  )
}

export default createTrip