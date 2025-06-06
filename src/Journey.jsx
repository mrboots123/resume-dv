import JobCard from "./card/JobCard.jsx";
import Header from "./Header.jsx";
import {FaNodeJs, FaReact} from "react-icons/fa";
import {RiTailwindCssFill} from "react-icons/ri";
import {SiLeaflet, SiPostgresql, SiTypescript} from "react-icons/si";
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import lbLogo from './assets/lightbox.png';
import carvanaLogo from './assets/carvana.png';
import americanExpressLogo from './assets/American-Express-Color.png'
import dasLogo from './assets/daLogo.png';
import syntelLogo from './assets/syntel.png';
import { FaJenkins } from "react-icons/fa";
import { FaRedhat } from "react-icons/fa";
import { FaJava } from "react-icons/fa";
import {BiLogoMongodb, BiLogoSpringBoot} from "react-icons/bi";
import { SiAuth0 } from "react-icons/si";
import { FaBootstrap } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";
import { TbBrandCSharp } from "react-icons/tb";

const Journey = () => {
    return (
        <div className={'h-screen w-screen flex flex-col px-4'}>
            <Header/>
            <div className={'text-3xl p-2'}> Diego Vazquez's Resume</div>
            <div className='flex'>
                <div className='w-full flex flex-col'>
                    <JobCard time='2022-2025' company={'LightBox'}
                             companyLogo={lbLogo}
                             summary={'Developed user‑friendly interactive maps within React applications, enabling\n' +
                                 '                   clear visualization and\n' +
                                 '                   exploration of geospatial data.'} title={'Senior Software Engineer'}>
                        <div className='flex items-center'>
                            <FaReact/>
                            <span className='pl-1'> React</span>
                        </div>
                        <div className='flex items-center'>
                            <RiTailwindCssFill/>
                            <span className='pl-1'> Tailwind</span>
                        </div>
                        <div className='flex items-center'>
                            <SiLeaflet/>
                            <span className='pl-1'> Leaflet</span>
                        </div>
                        <div className='flex items-center'>
                            <FaNodeJs/>
                            <span className='pl-1'> NodeJs</span>
                        </div>
                        <div className='flex items-center'>
                            <SiTypescript/>
                            <span className='pl-1'> Typescript</span>
                        </div>
                        <div className='flex items-center'>
                            <SiPostgresql/>
                            <span className='pl-1'> Postgres</span>
                        </div>
                    </JobCard>

                    <JobCard time='2022-2022' company={'Carvana'}
                             companyLogo={carvanaLogo}
                             summary={'Create internal applications for Carvana collision repair centers. Develop reusable react components and integrate into their Design Language System (DLS).'}
                             title={'Senior Fullstack Engineer'}>
                        <div className='flex items-center'>
                            <FaReact/>
                            <span className='pl-1'> React</span>
                        </div>
                        <div className='flex items-center'>
                            <FaBootstrap/>
                            <span className='pl-1'> Bootstrap</span>
                        </div>
                        <div className='flex items-center'>
                            <FaNodeJs/>
                            <span className='pl-1'> NodeJs</span>
                        </div>
                        <div className='flex items-center'>
                            <SiTypescript/>
                            <span className='pl-1'> Typescript</span>
                        </div>
                        <div className='flex items-center'>
                            <BiLogoMongodb/>
                            <span className='pl-1'> MongoDB</span>
                        </div>
                    </JobCard>

                    <JobCard time='2019-2022' company={'American Express'}
                             companyLogo={americanExpressLogo}
                             summary={'Worked under the David Jones Australian Card Team to create offers / manage card inside of One App ecosystem. Converted wireframes into applications using Reactjs and using latest javascript technologies.'}
                             title={'Full Stack Engineer'}>
                        <div className='flex items-center'>
                            <FaReact/>
                            <span className='pl-1'> React</span>
                        </div>
                        <div className='flex items-center'>
                            <FaJenkins/>
                            <span className='pl-1'> Jenkins</span>
                        </div>
                        <div className='flex items-center'>
                            <FaNodeJs/>
                            <span className='pl-1'> NodeJs</span>
                        </div>
                        <div className='flex items-center'>
                            <SiTypescript/>
                            <span className='pl-1'> Typescript</span>
                        </div>
                    </JobCard>

                    <JobCard time='2018-2019' company={'Digital AirStrike'}
                             companyLogo={dasLogo}
                             summary={'Contribute to creation of flag ship application for analysts to assist business clients. '}
                             title={'Front End Engineer'}>
                        <div className='flex items-center'>
                            <FaReact/>
                            <span className='pl-1'> React</span>
                        </div>

                        <div className='flex items-center'>
                            <FaBootstrap/>
                            <span className='pl-1'> BootStrap</span>
                        </div>
                        <div className='flex items-center'>
                            <VscAzure/>
                            <span className='pl-1'> Azure</span>
                        </div>
                        <div className='flex items-center'>
                            <TbBrandCSharp/>
                            <span className='pl-1'> C Sharp</span>
                        </div>
                        <div className='flex items-center'>
                            <SiAuth0/>
                            <span className='pl-1'> Auth0</span>
                        </div>
                        <div className='flex items-center'>
                            <SiTypescript/>
                            <span className='pl-1'> Typescript</span>
                        </div>
                    </JobCard>

                    <JobCard time='2016-2018' company={'Syntel'} companyLogo={syntelLogo}
                             summary={'Maintain and create new components for American Express Merchant portal. Use new wireframes to convert into front end components and integrate into One App'} title={'Full Stack Engineer'}>
                        <div className='flex items-center'>
                            <FaReact/>
                            <span className='pl-1'> React</span>
                        </div>
                        <div className='flex items-center'>
                            <FaJenkins />
                            <span className='pl-1'> Jenkins</span>
                        </div>
                        <div className='flex items-center'>
                            <FaRedhat/>
                            <span className='pl-1'> Red Hat</span>
                        </div>
                        <div className='flex items-center'>
                            <FaJava/>
                            <span className='pl-1'> Java</span>
                        </div>

                        <div className='flex items-center'>
                            <BiLogoSpringBoot />
                            <span className='pl-1'> Spring Boot</span>
                        </div>
                    </JobCard>
                </div>
                <div className='w-1/2'>
                    <MapContainer center={[39.8283, -98.5795]} zoom={4} scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[51.505, -0.09]}>
                            <Popup>
                                A pretty CSS3 popup. <br /> Easily customizable.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>

        </div>
    )
}

export default Journey;