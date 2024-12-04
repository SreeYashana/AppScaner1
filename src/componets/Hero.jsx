import { curve, heroBackground } from "../assets";
import Button from "./Button";
import Section from "./Section";
import { BackgroundCircles, BottomLine, Gradient } from "./design/Hero";
import { heroIcons } from "../constants";
import { ScrollParallax } from "react-just-parallax";
import { useRef, useState } from "react";
import Generating from "./Generating";
import Notification from "./Notification";

function Hero() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // State to manage upload status

  const handleFileInputChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setUploadStatus("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file_upload", file);

    try {
      const endpoint = "http://localhost:8000/uploadfile/"; // Corrected typo
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
      } else {
        setUploadStatus("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("An error occurred during upload.");
    }
  };

  const parallaxRef = useRef(null);

  return (
    <Section
      className="pt-[12rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      <div className="container relative" ref={parallaxRef}>
        {/* Hero Header */}
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
          <h1 className="h1 mb-6">
            Protect Your Android Apps: Early Detection of Vulnerabilities with{" "}
            <span className="inline-block relative">
              AppShield{" "}
              <img
                src={curve}
                className="absolute top-full left-0 w-full xl:-mt-2"
                width={624}
                height={28}
                alt="Decorative curve"
              />
            </span>
          </h1>
          <p className="body-1 max-w-3xl mx-auto mb-6 text-n-2 lg:mb-8">
            Empower your app security with AppShield. Detect vulnerabilities
            early and ensure robust protection with our advanced static analysis
            framework.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              onChange={handleFileInputChange}
              className="mb-4"
              accept=".apk"
            />
            <Button>
              <button type="submit">Upload Your APK File</button>
            </Button>
          </form>
          {file && <p>Selected File: {file.name}</p>}
          {uploadStatus && <p className="mt-2 text-white">{uploadStatus}</p>}
        </div>

        {/* Hero Image */}
        <div className="relative max-w-[23rem] mx-auto md:max-w-5xl xl:mb-24">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient">
            <div className="relative bg-n-8 rounded-[1rem]">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]" />
              <div className="aspect-[33/40] rounded-b-[0.9rem] overflow-hidden md:aspect-[688/490] lg:aspect-[1024/490]">
                <img
                  src={heroBackground}
                  className="w-full scale-[1.7] translate-y-[8%] md:scale-[1] md:-translate-y-[10%] lg:-translate-y-[23%]"
                  width={1024}
                  height={490}
                  alt="Hero Background"
                />
                <Generating className="absolute left-4 right-4 bottom-5 md:left-1/2 md:right-auto md:bottom-8 md:w-[31rem] md:-translate-x-1/2" />
                <ScrollParallax isAbsolutelyPositioned>
                  <ul className="hidden absolute -left-[5.5rem] bottom-[7.5rem] px-1 py-1 bg-n-9/40 backdrop-blur border border-n-1/10 rounded-2xl xl:flex">
                    {heroIcons.map((icon, index) => (
                      <li className="p-5" key={index}>
                        <img
                          src={icon}
                          width={24}
                          height={25}
                          alt={`Icon ${index + 1}`}
                        />
                      </li>
                    ))}
                  </ul>
                </ScrollParallax>
                <ScrollParallax isAbsolutelyPositioned>
                  <Notification
                    className="hidden absolute -right-[5.5rem] bottom-[11rem] w-[18rem] xl:flex"
                    title="Code generation"
                  />
                </ScrollParallax>
              </div>
            </div>
            <Gradient />
          </div>

          {/* Background Circles */}
          <div className="absolute -top-[54%] left-1/2 w-[234%] -translate-x-1/2 md:-top-[46%] md:w-[138%] lg:-top-[104%]">
            <img
              src={heroBackground}
              className="w-full"
              width={1440}
              height={1800}
              alt="Hero decorative circles"
            />
          </div>
          <BackgroundCircles />
        </div>
      </div>

      {/* Bottom Line */}
      <BottomLine />
    </Section>
  );
}

export default Hero;
