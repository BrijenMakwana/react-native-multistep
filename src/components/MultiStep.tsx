import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import ProgressCircle from './ProgressCircle';
import Animated, {
  FadeInLeft,
  Easing,
  FadeOutRight,
  LinearTransition,
} from 'react-native-reanimated';
import Step from './Step';
import type { MultiStepProps } from '../types';

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

const MultiStep = (props: MultiStepProps) => {
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
    indicatorTitleStyle,
    indicatorSubtitleStyle,
    progressCircleSize,
    progressCircleStrokeWidth,
    progressCircleTintColor,
    progressCircleTextStyle,
    headerStyle,
    formContainerStyle,
    buttonContainerStyle,
    onSubmit,
  } = props;

  const COLOR = tintColor || '#DE3163';

  const stepCountRef = useRef(React.Children.count(children));

  useEffect(() => {
    stepCountRef.current = React.Children.count(children);
  }, [children]);

  useEffect(() => {
    if (__DEV__) {
      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child) || child.type !== Step) {
          console.error(
            'MultiStep only accepts `Step` components as direct children.'
          );
        }
      });
    }
  }, [children]);

  const stepCount = stepCountRef.current;
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

  const { isValid, titles } = React.useMemo(() => {
    let allValid = true;

    const extractedTitles =
      React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || child.type !== Step) {
          allValid = false;
          return null;
        }

        return {
          title: child.props.title || '',
          titleStyle: child.props.titleStyle || {},
          subTitleStyle: child.props.subTitleStyle || {},
          titleComponent: child.props.titleComponent,
        };
      })?.filter(Boolean) || [];

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

  return (
    <View style={styles.multiStepContainer}>
      <View style={[styles.navigationHeader, headerStyle]}>
        <Animated.View
          style={styles.navigationItemWrapper}
          entering={FadeInLeft.duration(300).easing(Easing.inOut(Easing.quad))}
          exiting={FadeOutRight.duration(300).easing(Easing.inOut(Easing.quad))}
          key={currentStep}
        >
          {currentTitle?.titleComponent ? (
            <currentTitle.titleComponent />
          ) : (
            <Text
              style={[
                {
                  fontSize: 18,
                  fontWeight: '600',
                  color: COLOR,
                },
                indicatorTitleStyle,
                currentTitle?.titleStyle,
              ]}
            >
              {currentTitle?.title}
            </Text>
          )}

          <Text
            style={[
              styles.nextStepText,
              indicatorSubtitleStyle,
              currentTitle?.subTitleStyle,
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
          strokeWidth={progressCircleStrokeWidth}
          tintColor={progressCircleTintColor || COLOR}
          textStyle={progressCircleTextStyle}
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
            style={[styles.stepContentContainer, { width }, formContainerStyle]}
          >
            {item}
          </View>
        )}
        extraData={{ currentStep, stepCount }}
        itemLayoutAnimation={LinearTransition}
      />

      <View style={[styles.buttonGroup, buttonContainerStyle]}>
        <TouchableOpacity onPress={prevStep} disabled={currentStep === 0}>
          {prevButtonComponent ? (
            prevButtonComponent
          ) : (
            <Button
              title={prevButtonText || 'Back'}
              varient="secondary"
              tintColor={COLOR}
              style={prevButtonStyle}
              textStyle={prevButtonTextStyle}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={currentStep === stepCount - 1 ? onSubmit : nextStep}
        >
          {nextButtonComponent ? (
            nextButtonComponent
          ) : (
            <Button
              title={
                currentStep === stepCount - 1
                  ? 'Submit'
                  : nextButtonText || 'Next'
              }
              varient="primary"
              tintColor={COLOR}
              style={nextButtonStyle}
              textStyle={nextButtonTextStyle}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MultiStep;

const styles = StyleSheet.create({
  multiStepContainer: {
    flex: 1,
    paddingTop: 20,
    gap: 10,
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
  nextStepText: {
    color: '#45474B',
  },
  stepContentContainer: {
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
});
