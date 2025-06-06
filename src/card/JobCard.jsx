
const JobCard = ({time, title, summary, company, children, office, companyLogo, coordinates, setActivePopup}) => {
   return <div className='flex flex-col h-2/5 w-full p-2' onMouseEnter={() => {

       setActivePopup({
           coordinates,
           companyName: company,
           officeImg: office,
       })
   }}
               onMouseLeave={() => {

                   setActivePopup(undefined)

               }}
   >


       <div className='text-sm font-bold'>
           <div className='flex justify-center outline rounded-t-sm w-1/6 bg-[#F8D775] p-2'>
               {time}
           </div>
       </div>
       <div className='flex  outline bg-[#F8D775] rounded-sm rounded-tl-none'>
           <div className={'w-2/8 flex flex-col '}>
               <div className='flex flex-col grow justify-center items-center'>

                   <img src={companyLogo} height={'auto'} width={'80%'}></img>
               </div>

           </div>
           <div className='w-6/8 flex flex-col'>

               <div className='text-lg font-bold pt-2'>{title}</div>
               <p className='text-sm py-2'>
                   { summary }
               </p>


               <div className="grid grid-cols-3 gap-2 grow pb-2">
                   {
                       children
                   }
               </div>
           </div>
       </div>
   </div>
};

export default JobCard;
