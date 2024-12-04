import ButtonGradient from "./assets/svg/ButtonGradient";
// import Benefits from "./componets/Benefits";
// // import Button from "./componets/Button";
// import Header from "./componets/Header";
// import Hero from "./componets/Hero";
// import Collaboration from "./componets/Collaboration";
import Mobsf from "./componets/Mobsf";

const App = () => {
  return (
    <>
      <div className="pt-[4.75 rem] lg:pt-[5.25rem] overflow-hidden">
        {/* <Button className="mt-10" herf="#login">
          Something
        </Button> */}
        {/* <Header />
        <Hero />
        <Benefits />
        <Collaboration /> */}
        <Mobsf />
      </div>
      <ButtonGradient />
    </>
  );
};
export default App;
