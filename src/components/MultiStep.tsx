import {
  View,
  StyleSheet,
  FlatList,
  Text,
  useWindowDimensions,
} from 'react-native';
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Button from './Button';
import ProgressCircle from './ProgressCircle';
import Animated, {
  FadeInLeft,
  Easing,
  FadeOutRight,
  LinearTransition,
} from 'react-native-reanimated';
import Step from './Step';
import type { MultiStepProps, StepProps, MultiStepRef } from '../types';

/**
 * A multi-step container for managing step-based navigation.
 * It provides built-in navigation between steps with customizable buttons.
 *
 * @example
 * ```tsx
 * <MultiStep>
 *   <Step title="Step 1">
 *     <Text>Content for Step 1</Text>
 *   </Step>
 *   <Step title="Step 2">
 *     <Text>Content for Step 2</Text>
 *   </Step>
 * </MultiStep>
 * ```
 */

const MultiStep = forwardRef<MultiStepRef, MultiStepProps>((props, ref) => {
  const {
    children,
    prevButtonText,
    nextButtonText,
    prevButtonStyle,
    nextButtonStyle,
    prevButtonTextStyle,
    nextButtonTextStyle,
    prevButtonComponent,
    nextButtonComponent,
    tintColor,
    globalStepTitleStyle,
    globalNextStepTitleStyle,
    progressCircleSize,
    progressCircleThickness,
    progressCircleColor,
    progressCircleTrackColor,
    progressCircleLabelStyle,
    headerStyle,
    globalStepContainerStyle,
    fullScreenHeight,
    buttonContainerStyle,
    onFinalStepSubmit,
    submitButtonText,
    submitButtonTextStyle,
    submitButtonStyle,
    submitButtonComponent,
  } = props;

  const COLOR = tintColor || '#DE3163';

  const stepCount = React.useMemo(
    () => React.Children.count(children),
    [children]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { width } = useWindowDimensions();

  const nextStep = () => {
    if (currentStep < stepCount - 1) {
      setCurrentStep((prev) => {
        const nextIndex = prev + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => {
        const prevIndex = prev - 1;
        flatListRef.current?.scrollToIndex({
          index: prevIndex,
          animated: true,
        });
        return prevIndex;
      });
    }
  };

  useImperativeHandle(ref, () => ({
    nextStep,
    prevStep,
    scrollToStep: (index) => {
      if (index >= 0 && index < stepCount) {
        setCurrentStep(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
      }
    },
  }));

  const { isValid, titles } = React.useMemo(() => {
    const extractedTitles: Pick<
      StepProps,
      'title' | 'stepTitleStyle' | 'nextStepTitleStyle' | 'titleComponent'
    >[] = [];

    let allValid = true;

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child) || child.type !== Step) {
        allValid = false;
        return;
      }

      extractedTitles.push({
        title: child.props.title || '',
        stepTitleStyle: child.props.stepTitleStyle || {},
        nextStepTitleStyle: child.props.nextStepTitleStyle || {},
        titleComponent: child.props.titleComponent,
      });
    });

    return { isValid: allValid, titles: extractedTitles };
  }, [children]);

  if (!isValid) {
    if (__DEV__)
      console.error(
        'MultiStep only accepts `Step` components as direct children.'
      );
    return null;
  }

  if (titles.length === 0) {
    if (__DEV__)
      console.error('MultiStep requires at least one Step component.');
    return null;
  }

  const currentTitle = titles[currentStep];
  const isFinalStep = currentStep === stepCount - 1;

  return (
    <View
      style={[
        styles.multiStepContainer,
        fullScreenHeight && {
          flex: 1,
        },
      ]}
    >
      <View style={[styles.navigationHeader, headerStyle]}>
        <Animated.View
          style={styles.navigationItemWrapper}
          entering={FadeInLeft.duration(300).easing(Easing.inOut(Easing.quad))}
          exiting={FadeOutRight.duration(300).easing(Easing.inOut(Easing.quad))}
          key={currentStep}
        >
          {currentTitle?.titleComponent ? (
            currentTitle.titleComponent
          ) : (
            <Text
              style={[
                styles.currentStepTect,
                {
                  color: COLOR,
                },
                globalStepTitleStyle,
                currentTitle?.stepTitleStyle,
              ]}
            >
              {currentTitle?.title}
            </Text>
          )}

          <Text
            style={[
              styles.nextStepText,
              globalNextStepTitleStyle,
              currentTitle?.nextStepTitleStyle,
            ]}
          >
            {currentStep < stepCount - 1
              ? `Next: ${titles[currentStep + 1]?.title}`
              : 'Completion'}
          </Text>
        </Animated.View>

        <ProgressCircle
          currentStep={currentStep + 1}
          totalSteps={titles.length}
          size={progressCircleSize}
          progressCircleThickness={progressCircleThickness}
          progressColor={progressCircleColor || COLOR}
          trackColor={progressCircleTrackColor}
          progressCircleLabelStyle={progressCircleLabelStyle}
        />
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={React.Children.toArray(children)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[styles.stepContainer, { width }, globalStepContainerStyle]}
          >
            {item}
          </View>
        )}
        extraData={{ currentStep, stepCount }}
        itemLayoutAnimation={LinearTransition}
      />

      <View style={[styles.buttonGroup, buttonContainerStyle]}>
        {prevButtonComponent ?? (
          <Button
            title={prevButtonText || 'Back'}
            variant="secondary"
            tintColor={COLOR}
            style={prevButtonStyle}
            textStyle={prevButtonTextStyle}
            onPress={prevStep}
            disabled={currentStep === 0}
          />
        )}

        {!isFinalStep &&
          (nextButtonComponent ?? (
            <Button
              title={nextButtonText || 'Next'}
              variant="primary"
              tintColor={COLOR}
              style={nextButtonStyle}
              textStyle={nextButtonTextStyle}
              onPress={nextStep}
            />
          ))}

        {isFinalStep &&
          (submitButtonComponent ?? (
            <Button
              title={submitButtonText || 'Submit'}
              variant="primary"
              tintColor={COLOR}
              style={submitButtonStyle}
              textStyle={submitButtonTextStyle}
              onPress={onFinalStepSubmit}
            />
          ))}
      </View>
    </View>
  );
});

export default MultiStep;

const styles = StyleSheet.create({
  multiStepContainer: {
    gap: 15,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
    width: '100%',
    paddingHorizontal: 15,
  },
  navigationItemWrapper: {
    flex: 1,
    gap: 10,
  },
  stepContainer: {
    paddingHorizontal: 15,
  },
  currentStepTect: {
    fontSize: 18,
    fontWeight: '600',
  },
  nextStepText: {
    color: '#45474B',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
  },
});
