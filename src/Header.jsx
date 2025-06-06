import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";

const Header = () => {
    return (
        <div className='flex justify-end'>
            <div>
                <FaGithub onClick={() => {
                    window.location.href='https://github.com/mrboots123'
                }} className='pr-2' size={'2em'}/>
            </div>
            <div>
                <MdEmail
                    onClick={() => {
                        window.location.href='mailto:vazquez.diego59@gmail.com'
                    }}
                    className='pr-2' size={'2em'} />
            </div>
            <div>
                <BsFillTelephoneFill
                    onClick={() => {
                        window.location.href="tel:+16023171162"
                    }}
                    className='pr-2' size={'2em'}/>
            </div>
            <FaLinkedin
                onClick={() => {
                    window.location.href='https://www.linkedin.com/in/diego-vazquez-81b60211a/'
                }}
                className='pr-2' size={'2em'}/>

        </div>
    )
};

export default Header;