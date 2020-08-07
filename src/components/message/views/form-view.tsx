import { SendMessageIcon } from '@/components/icons/send-message';
import { useSendMessage } from '@/components/message/data/conversations';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';

type FormValues = {
  message: string;
};

const messageSchema = yup.object().shape({
  message: yup.string().required('error-body-required'),
});

const CreateMessageForm = () => {
  const {
    register,
    handleSubmit,
    getValues,
    setFocus,
    reset,
    //@ts-ignore
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
  });

  const router = useRouter();
  const { query } = router;
  const { createMessage, isLoading: creating } = useSendMessage();
  useEffect(() => {
    const listener = (event: any) => {
      if (event.key === 'Enter' && event.shiftKey) {
        return false;
      }
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        const values = getValues();
        onSubmit(values);
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [query?.id]);
  const onSubmit = async (values: FormValues) => {
    try {
      if (isEmpty(values.message)) {
        toast?.error('Message is required');
        return;
      }
      await createMessage({
        variables: {
          input: {
            message: values?.message,
            conversation_id: query?.id as string,
          },
        },
      });
      const chatBody = document.getElementById('chatBody');
      chatBody?.scrollTo({
        top: chatBody?.scrollHeight,
        behavior: 'smooth',
      });
      reset();
    } catch (error: any) {
      toast?.error(error);
    }
  };
  useEffect(() => {
    setFocus('message');
  }, [setFocus]);
  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="relative">
          {!!creating ? (
            <div className="absolute top-0 left-0 z-50 flex h-full w-full cursor-not-allowed bg-[#EEF1F4]/50">
              <div className="w-4 h-5 m-auto border-2 border-t-2 border-transparent rounded-full animate-spin border-t-accent"></div>
            </div>
          ) : (
            ''
          )}
          <TextArea
            className="overflow-x-hidden overflow-y-auto shadow-chatBox"
            placeholder="Type your message here.."
            {...register('message')}
            variant="solid"
            inputClassName="!border-0 bg-white pr-12 block !h-full"
            rows={3}
            disabled={!!creating}
          />
          <div className="absolute top-0 right-0 h-full">
            <Button
              className="!h-full px-4 text-lg focus:!shadow-none focus:!ring-0"
              variant="custom"
              disabled={!!creating}
            >
              <SendMessageIcon />
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateMessageForm;
