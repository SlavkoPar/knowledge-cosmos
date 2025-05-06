import * as React from "react";

import image5 from 'screenshots/image5.png'
import image1 from 'screenshots/image1.png'
import image2 from 'screenshots/image2.png'
import image3 from 'screenshots/image3.png'
import image4 from 'screenshots/image4.png'
import { useGlobalContext } from "global/GlobalProvider";

interface IAboutShort {
}

const AboutShort: React.FC<IAboutShort> = (props: IAboutShort) => {

  // const { setLastRouteVisited } = useGlobalContext();
  
  return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-secondary text-white w-75 mx-auto p-2 rounded-3">
      <h5>Questions &amp; Answers</h5>
      <div>Build your knowledge base for sharing information.</div>
      <div>When you record your experiences and insights,</div>
      <div>other members of your team can share info.</div>
     </div>
  )
}

export default AboutShort;
