/* eslint-disable react/jsx-key */
/* eslint-disable react/react-in-jsx-scope */
import PropTypes from "prop-types";
import "./StepsCircle.module.less";

function StepsCircle(props) {
  const { activeStep, totalStep } = props;
  return (
    <div className="stepsContainer">
      {[...new Array(totalStep)].map((v, i) => {
        const step = i + 1;
        const isActive = step === activeStep;
        return (
          <div
            className={`${isActive ? "stepIndicator-active" : "stepIndicator"}`}
          />
        );
      })}
    </div>
  );
}

StepsCircle.propTypes = {
  totalStep: PropTypes.oneOf([2, 3, 4, 5]).isRequired,
  activeStep: PropTypes.oneOf([1, 2, 3, 4, 5]).isRequired,
};

StepsCircle.defaultProps = {
  totalStep: 2,
  activeStep: 1,
};
export default StepsCircle;
