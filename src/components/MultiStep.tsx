import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import React, { useState, useRef } from 'react';
import Button from './Button';
import ProgressCircle from './ProgressCircle';
import type { MultiStepProps } from '../ types';
import Animated, {
  FadeInLeft,
  Easing,
  FadeOutRight,
  LinearTransition,
} from 'react-native-reanimated';

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
    onSubmit,
    ...rest
  } = props;

  const COLOR = tintColor || '#DE3163';

  const stepCount = React.Children.count(children);
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { width } = useWindowDimensions();

  const nextStep = () => {
    if (currentStep < stepCount - 1) {
      setCurrentStep((prev) => prev + 1);
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      flatListRef.current?.scrollToIndex({
        index: currentStep - 1,
        animated: true,
      });
    }
  };

  const titles = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return {
        title: child.props.title || '',
        titleStyle: child.props.titleStyle || {},
        subTitleStyle: child.props.subTitleStyle || {},
        titleComponent: child.props.titleComponent,
      };
    }
    return {
      title: '',
      titleStyle: {},
      subTitleStyle: {},
      titleComponent: null,
    };
  });

  if (!titles || titles.length === 0) {
    if (__DEV__)
      console.error('MultiStep requires at least one Step component.');
    return null;
  }

  const currentTitle = titles[currentStep];

  return (
    <View style={styles.container} {...rest}>
      <View style={styles.navigationContainer}>
        <Animated.View
          style={styles.navigationItem}
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
              styles.nextStepTitle,
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
          <View style={[styles.stepContainer, { width }]}>{item}</View>
        )}
        extraData={currentStep}
        itemLayoutAnimation={LinearTransition}
      />

      <View style={styles.buttonContainer}>
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
  container: {
    flex: 1,
    paddingTop: 20,
    gap: 10,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    width: '100%',
    paddingHorizontal: 15,
  },
  navigationItem: {
    flex: 1,
    gap: 10,
  },
  nextStepTitle: {
    color: '#45474B',
  },
  stepContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
});
