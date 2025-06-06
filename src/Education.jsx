import asuLogo from './assets/asu-logo.png';
const Education = props => {
    return (
        <div className='flex flex-col w-full py-3'>

            <div className="flex pb-3">
                <h1 className="text-2xl font-bold">Education</h1>
                <span className="flex flex-col w-full p-3">
  <hr className="border-0 h-px bg-gray-300 w-full"/>
            </span>
            </div>

            <div className='flex'>
                <img src={asuLogo} height={'auto'} width={'15%'}/>
                <div className={'flex flex-col pl-3 font-bold text-lg'}>
                    <div>Bachelor of Science, Arizona State University, 2016

                    </div>
                    <div>Computer Science, B.S</div>

                </div>
            </div>

        </div>
    )
};

export default Education;